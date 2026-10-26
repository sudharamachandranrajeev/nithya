import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nithya/nithya.dart';

double _luminance(Color c) => c.computeLuminance();

double contrast(Color a, Color b) {
  final (hi, lo) = (math.max(_luminance(a), _luminance(b)), math.min(_luminance(a), _luminance(b)));
  return (hi + 0.05) / (lo + 0.05);
}

Widget host(Widget child, {NithyaPalette? palette}) => MaterialApp(
  theme: nithyaTheme(palette),
  home: Scaffold(body: Center(child: child)),
);

void main() {
  group('palettes', () {
    for (final p in nithyaPalettes.values) {
      test('${p.name}: text meets WCAG AA on every surface', () {
        for (final surface in [p.background, p.panel, p.modal]) {
          expect(contrast(p.foreground, surface), greaterThanOrEqualTo(7), reason: 'foreground on $surface');
          expect(contrast(p.muted, surface), greaterThanOrEqualTo(4.5), reason: 'muted on $surface');
        }
        expect(contrast(p.foreground, p.controls), greaterThanOrEqualTo(4.5), reason: 'foreground on controls');
      });

      test('${p.name}: theme carries the palette', () {
        final theme = nithyaTheme(p);
        expect(theme.extension<NithyaPalette>(), same(p));
        expect(theme.brightness, p.brightness);
        expect(theme.colorScheme.primary, NithyaAccent.primary);
      });
    }

    test('primary label is readable on primary', () {
      expect(contrast(NithyaAccent.onPrimary, NithyaAccent.primary), greaterThanOrEqualTo(3));
    });

    test('lerp blends colours and snaps discrete fields', () {
      final a = nithyaPalettes['dusk']!, b = nithyaPalettes['daylight']!;
      final mid = a.lerp(b, 0.75);
      expect(mid.name, 'daylight');
      expect(mid.brightness, Brightness.light);
      expect(mid.background, Color.lerp(a.background, b.background, 0.75));
    });
  });

  testWidgets('icon buttons expose their label to tooltips and semantics', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(host(NithyaIconButton(icon: Icons.settings, label: 'Settings', onPressed: () {})));
    expect(tester.getSemantics(find.byType(IconButton)), isSemantics(tooltip: 'Settings', isButton: true));
    expect(find.byTooltip('Settings'), findsOneWidget);
    handle.dispose();
  });

  testWidgets('mode switcher reports the tapped mode', (tester) async {
    int? picked;
    await tester.pumpWidget(
      host(
        NithyaModeSwitcher(
          modes: const [
            NithyaMode(icon: Icons.home, label: 'Home'),
            NithyaMode(icon: Icons.image, label: 'Image'),
          ],
          selected: 0,
          onSelected: (i) => picked = i,
        ),
      ),
    );
    await tester.tap(find.byTooltip('Image'));
    expect(picked, 1);
  });

  testWidgets('a SOON tool card ignores taps', (tester) async {
    var taps = 0;
    await tester.pumpWidget(
      host(
        SizedBox(
          width: 400,
          child: NithyaToolCard(
            icon: Icons.water_drop,
            hue: NithyaHues.red,
            title: 'Later',
            description: 'Not yet',
            badge: NithyaBadgeKind.soon,
            onTap: () => taps++,
          ),
        ),
      ),
    );
    await tester.tap(find.text('Later'));
    expect(taps, 0);
    expect(find.text('SOON'), findsOneWidget);
  });

  group('prompt dock', () {
    Future<List<String>> run(WidgetTester tester, {required bool enterToSubmit, bool shift = false}) async {
      final sent = <String>[];
      await tester.pumpWidget(
        host(
          SizedBox(
            width: 800,
            child: NithyaPromptDock(enterToSubmit: enterToSubmit, onSubmit: sent.add),
          ),
        ),
      );
      await tester.enterText(find.byType(TextField), 'a red kite');
      if (shift) await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      if (shift) await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      await tester.pump();
      return sent;
    }

    testWidgets('Enter sends when enabled', (tester) async {
      expect(await run(tester, enterToSubmit: true), ['a red kite']);
    });

    testWidgets('Shift+Enter never sends', (tester) async {
      expect(await run(tester, enterToSubmit: true, shift: true), isEmpty);
    });

    testWidgets('Enter does not send when disabled', (tester) async {
      expect(await run(tester, enterToSubmit: false), isEmpty);
    });

    testWidgets('send button is disabled until there is text', (tester) async {
      final sent = <String>[];
      await tester.pumpWidget(host(SizedBox(width: 800, child: NithyaPromptDock(onSubmit: sent.add))));
      await tester.tap(find.byTooltip('Generate'));
      expect(sent, isEmpty);
      await tester.enterText(find.byType(TextField), '  dune at dusk ');
      await tester.pump();
      await tester.tap(find.byTooltip('Generate'));
      expect(sent, ['dune at dusk']);
    });
  });

  testWidgets('sectioned dialog switches sections and closes', (tester) async {
    await tester.pumpWidget(
      host(
        Builder(
          builder: (context) => TextButton(
            onPressed: () => showNithyaDialog<void>(
              context,
              builder: (_) => NithyaSectionedDialog(
                title: 'Settings',
                sections: [
                  NithyaSection(icon: Icons.settings, label: 'General', builder: (_) => const Text('general body')),
                  NithyaSection(icon: Icons.palette, label: 'Appearance', builder: (_) => const Text('looks body')),
                ],
              ),
            ),
            child: const Text('open'),
          ),
        ),
      ),
    );
    tester.view.physicalSize = const Size(1400, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    expect(find.text('general body'), findsOneWidget);
    await tester.tap(find.text('Appearance'));
    await tester.pumpAndSettle();
    expect(find.text('looks body'), findsOneWidget);
    await tester.tap(find.byTooltip('Close'));
    await tester.pumpAndSettle();
    expect(find.text('looks body'), findsNothing);
  });
}

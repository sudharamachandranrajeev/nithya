// Renders the studio for the README and smoke-tests every screen in every theme.
//
//   NITHYA_SHOTS=../../docs/screenshots FLUTTER_ROOT=$(dirname $(dirname $(readlink -f $(which flutter)))) \
//     flutter test test/screenshots_test.dart
//
// Without NITHYA_SHOTS the screens are still pumped, so this doubles as a smoke test.
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nithya/nithya.dart';
import 'package:nithya_studio/main.dart';

const _fonts = '../assets/fonts';

Future<void> _loadFonts() async {
  Future<void> family(String name, List<String> files) async {
    final loader = FontLoader(name);
    for (final f in files) {
      loader.addFont(Future.value(ByteData.sublistView(File(f).readAsBytesSync())));
    }
    await loader.load();
  }

  await family('packages/nithya/Inter', [
    for (final w in ['Regular', 'Medium', 'SemiBold', 'Bold']) '$_fonts/Inter-$w.ttf',
  ]);
  await family('packages/nithya/PlusJakartaSans', [
    for (final w in ['Medium', 'SemiBold', 'Bold', 'ExtraBold']) '$_fonts/PlusJakartaSans-$w.ttf',
  ]);
  final root = Platform.environment['FLUTTER_ROOT'];
  if (root != null) {
    await family('MaterialIcons', ['$root/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf']);
  }
}

void main() {
  final out = Platform.environment['NITHYA_SHOTS'];

  setUpAll(_loadFonts);

  Future<void> shot(WidgetTester tester, String name, Widget app, {Future<void> Function()? then}) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(RepaintBoundary(key: const ValueKey('shot'), child: app));
    await tester.pumpAndSettle();
    if (then != null) {
      await then();
      await tester.pumpAndSettle();
    }
    expect(tester.takeException(), isNull);
    if (out == null) return;
    await tester.runAsync(() async {
      final boundary = tester.renderObject<RenderRepaintBoundary>(find.byKey(const ValueKey('shot')));
      final image = await boundary.toImage();
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      Directory(out).createSync(recursive: true);
      File('$out/flutter-$name.png').writeAsBytesSync(bytes!.buffer.asUint8List());
    });
  }

  testWidgets('launcher', (t) => shot(t, 'launcher', const StudioApp()));
  testWidgets('generate', (t) => shot(t, 'generate', const StudioApp(initialMode: 1, initialTheme: 'lagoon')));
  testWidgets('canvas', (t) => shot(t, 'canvas', const StudioApp(initialMode: 4)));
  testWidgets(
    'canvas size dialog',
    (t) => shot(
      t,
      'canvas-size',
      const StudioApp(initialMode: 4, initialTheme: 'ember'),
      then: () async {
        await t.tap(find.text('Blank canvas'));
        await t.pumpAndSettle();
        await t.tap(find.text('1920 × 1080'));
      },
    ),
  );
  testWidgets('stage', (t) => shot(t, 'stage', const StudioApp(initialMode: 5)));
  testWidgets(
    'settings',
    (t) => shot(
      t,
      'settings',
      const StudioApp(initialTheme: 'graphite'),
      then: () async {
        await t.tap(find.byTooltip('Settings'));
        await t.pumpAndSettle();
        await t.tap(find.text('Appearance'));
      },
    ),
  );
  for (final theme in nithyaPalettes.keys) {
    testWidgets('launcher in $theme', (t) => shot(t, 'theme-$theme', StudioApp(initialTheme: theme)));
  }
}

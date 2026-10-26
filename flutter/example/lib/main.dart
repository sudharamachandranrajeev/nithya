import 'package:flutter/material.dart';
import 'package:nithya/nithya.dart';

import 'screens.dart';

void main() => runApp(const StudioApp());

/// Demo studio: every screen is assembled from Nithya components only.
class StudioApp extends StatefulWidget {
  const StudioApp({super.key, this.initialMode = 0, this.initialTheme});

  final int initialMode;
  final String? initialTheme;

  @override
  State<StudioApp> createState() => _StudioAppState();
}

class _StudioAppState extends State<StudioApp> {
  late String _theme = widget.initialTheme ?? nithyaPalettes.keys.first;
  late int _mode = widget.initialMode;
  bool _enterToSubmit = false;

  static const modes = [
    NithyaMode(icon: Icons.home_outlined, label: 'Home'),
    NithyaMode(icon: Icons.image_outlined, label: 'Image'),
    NithyaMode(icon: Icons.movie_outlined, label: 'Video'),
    NithyaMode(icon: Icons.music_note_outlined, label: 'Audio'),
    NithyaMode(icon: Icons.draw_outlined, label: 'Canvas'),
    NithyaMode(icon: Icons.view_in_ar_outlined, label: 'Stage'),
  ];

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Nithya Studio',
    debugShowCheckedModeBanner: false,
    theme: nithyaTheme(nithyaPalettes[_theme]),
    home: Scaffold(body: Builder(builder: (context) => _shell(context))),
  );

  Widget _shell(BuildContext context) {
    final p = NithyaPalette.of(context);
    void go(int mode) => setState(() => _mode = mode);
    final (title, body) = switch (_mode) {
      1 => ('Create Image', GenerateScreen(kind: 'image', enterToSubmit: _enterToSubmit)),
      2 => ('Create Video', GenerateScreen(kind: 'video', enterToSubmit: _enterToSubmit)),
      3 => ('Create Audio', GenerateScreen(kind: 'audio', enterToSubmit: _enterToSubmit)),
      4 => ('Canvas', const CanvasScreen()),
      5 => ('Stage', const StageScreen()),
      _ => ('Nithya Studio', LauncherScreen(onOpen: go)),
    };
    return NithyaShell(
      modes: modes,
      selectedMode: _mode,
      onModeSelected: go,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.auto_awesome, size: 18, color: NithyaAccent.primary),
          const SizedBox(width: NithyaSpace.sm),
          Text(title),
        ],
      ),
      actions: [
        Text('120 credits', style: NithyaType.label.toStyle(color: p.muted)),
        NithyaButton(label: 'Upgrade', icon: Icons.diamond_outlined, onPressed: () {}),
        NithyaIconButton(icon: Icons.ios_share_rounded, label: 'Share', filled: true, onPressed: () {}),
        NithyaIconButton(
          icon: Icons.settings_outlined,
          label: 'Settings',
          filled: true,
          onPressed: () => showNithyaDialog<void>(context, builder: (_) => _settings()),
        ),
        NithyaButton(
          label: 'Library',
          icon: Icons.photo_library_outlined,
          variant: NithyaButtonVariant.secondary,
          onPressed: () {},
        ),
        NithyaIconButton(icon: Icons.checklist_rounded, label: 'Tasks', filled: true, onPressed: () {}),
      ],
      cornerActions: _mode == 0
          ? const []
          : [
              NithyaChip(label: 'Costs', icon: Icons.calculate_outlined, onPressed: () {}),
              NithyaChip(label: 'Help', icon: Icons.help_outline_rounded, onPressed: () {}),
            ],
      body: body,
    );
  }

  Widget _settings() => StatefulBuilder(
    builder: (context, setLocal) {
      void update(VoidCallback f) {
        setState(f);
        setLocal(() {});
      }

      return NithyaSectionedDialog(
        title: 'Settings',
        sections: [
          NithyaSection(
            icon: Icons.settings_outlined,
            label: 'General',
            builder: (_) => NithyaSwitchRow(
              title: 'Enter to generate',
              description: 'On: Enter sends the prompt and Shift+Enter adds a line. Off: only the button sends.',
              value: _enterToSubmit,
              onChanged: (v) => update(() => _enterToSubmit = v),
            ),
          ),
          NithyaSection(
            icon: Icons.palette_outlined,
            label: 'Appearance',
            builder: (_) => Wrap(
              spacing: NithyaSpace.md,
              runSpacing: NithyaSpace.md,
              children: [
                for (final palette in nithyaPalettes.values)
                  NithyaSelectTile(
                    selected: palette.name == _theme,
                    label: palette.label,
                    onTap: () => update(() => _theme = palette.name),
                    child: ThemeSwatch(palette: palette),
                  ),
              ],
            ),
          ),
          NithyaSection(
            icon: Icons.info_outline_rounded,
            label: 'About',
            builder: (context) => Text(
              'Nithya Studio is a reference app for the Nithya design framework.',
              style: NithyaType.body.toStyle(color: NithyaPalette.of(context).muted),
            ),
          ),
        ],
      );
    },
  );
}

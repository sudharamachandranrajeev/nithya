import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:nithya/nithya.dart';

class LauncherScreen extends StatelessWidget {
  const LauncherScreen({super.key, required this.onOpen});

  final ValueChanged<int> onOpen;

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.symmetric(horizontal: NithyaSpace.xl, vertical: NithyaSpace.huge),
    child: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1104),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const NithyaHero(
              title: 'What will you make today?',
              accent: 'make',
              subtitle: 'Pick a tool and start creating.',
            ),
            const SizedBox(height: NithyaSpace.xxl),
            const NithyaSectionLabel('Create'),
            NithyaToolGrid(
              children: [
                NithyaToolCard(
                  icon: Icons.image_outlined,
                  hue: NithyaHues.blue,
                  title: 'Image',
                  description: 'Generate images from a prompt',
                  onTap: () => onOpen(1),
                ),
                NithyaToolCard(
                  icon: Icons.movie_outlined,
                  hue: NithyaHues.amber,
                  title: 'Video',
                  description: 'Animate stills into clips',
                  onTap: () => onOpen(2),
                ),
                NithyaToolCard(
                  icon: Icons.music_note_outlined,
                  hue: NithyaHues.rose,
                  title: 'Audio',
                  description: 'Music and sound effects',
                  onTap: () => onOpen(3),
                ),
                NithyaToolCard(
                  icon: Icons.view_in_ar_outlined,
                  hue: NithyaHues.green,
                  title: 'Stage',
                  description: 'Block scenes and cameras in 3D',
                  onTap: () => onOpen(5),
                ),
                NithyaToolCard(
                  icon: Icons.public_rounded,
                  hue: NithyaHues.sky,
                  title: 'Worlds',
                  description: 'Turn a reference into an environment',
                  badge: NithyaBadgeKind.fresh,
                  onTap: () {},
                ),
                NithyaToolCard(
                  icon: Icons.dashboard_customize_outlined,
                  hue: NithyaHues.slate,
                  title: 'Boards',
                  description: 'Collect references on a board',
                  badge: NithyaBadgeKind.beta,
                  onTap: () {},
                ),
              ],
            ),
            const NithyaSectionLabel('Edit'),
            NithyaToolGrid(
              children: [
                NithyaToolCard(
                  icon: Icons.draw_outlined,
                  hue: NithyaHues.violet,
                  title: 'Canvas',
                  description: 'Layer, mask and paint',
                  onTap: () => onOpen(4),
                ),
                NithyaToolCard(
                  icon: Icons.auto_fix_high_outlined,
                  hue: NithyaHues.teal,
                  title: 'Cut out',
                  description: 'Remove backgrounds',
                  onTap: () {},
                ),
                const NithyaToolCard(
                  icon: Icons.water_drop_outlined,
                  hue: NithyaHues.red,
                  title: 'Clean up',
                  description: 'Remove marks from footage',
                  badge: NithyaBadgeKind.soon,
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

class GenerateScreen extends StatelessWidget {
  const GenerateScreen({super.key, required this.kind, required this.enterToSubmit});

  final String kind;
  final bool enterToSubmit;

  @override
  Widget build(BuildContext context) {
    final label = '${kind[0].toUpperCase()}${kind.substring(1)}';
    return Stack(
      children: [
        Center(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 120),
            child: NithyaHero(title: 'Create $label', subtitle: 'Add a prompt, then generate'),
          ),
        ),
        Positioned(
          left: NithyaSpace.xl,
          right: NithyaSpace.xl,
          bottom: 72,
          child: Center(
            child: NithyaPromptDock(
              key: ValueKey(kind),
              hint: 'Describe the $kind you want…',
              enterToSubmit: enterToSubmit,
              leading: NithyaReferenceSlot(onPressed: () {}),
              options: [
                NithyaChip(label: 'Model', icon: Icons.auto_awesome_outlined, onPressed: () {}),
                NithyaChip(label: '16:9', icon: Icons.crop_16_9_rounded, onPressed: () {}),
                NithyaChip(label: '1K', icon: Icons.high_quality_outlined, onPressed: () {}),
              ],
              onSubmit: (text) => ScaffoldMessenger.maybeOf(context)?.showSnackBar(SnackBar(content: Text(text))),
            ),
          ),
        ),
      ],
    );
  }
}

class CanvasScreen extends StatelessWidget {
  const CanvasScreen({super.key});

  static const sizes = {
    'Square': [(512, 512), (1024, 1024), (1536, 1536)],
    'Landscape': [(1280, 720), (1920, 1080), (2560, 1440)],
    'Portrait': [(720, 1280), (1080, 1920)],
  };

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(NithyaSpace.huge * 2, NithyaSpace.huge * 2, NithyaSpace.huge * 2, 120),
    child: NithyaDropZone(
      icon: Icons.edit_outlined,
      title: 'Edit an image',
      hint: 'Drop an image here, or pick one to start',
      actions: [
        NithyaButton(label: 'Choose file', icon: Icons.upload_rounded, large: true, onPressed: () {}),
        NithyaButton(
          label: 'From library',
          icon: Icons.photo_library_outlined,
          large: true,
          variant: NithyaButtonVariant.secondary,
          onPressed: () {},
        ),
        NithyaButton(
          label: 'Blank canvas',
          icon: Icons.crop_free_rounded,
          large: true,
          variant: NithyaButtonVariant.secondary,
          onPressed: () => showNithyaDialog<(int, int)>(context, builder: (_) => const CanvasSizeDialog()),
        ),
      ],
    ),
  );
}

class CanvasSizeDialog extends StatefulWidget {
  const CanvasSizeDialog({super.key});

  @override
  State<CanvasSizeDialog> createState() => _CanvasSizeDialogState();
}

class _CanvasSizeDialogState extends State<CanvasSizeDialog> {
  (int, int)? _size;

  @override
  Widget build(BuildContext context) {
    final p = NithyaPalette.of(context);
    return NithyaDialog(
      title: 'Canvas size',
      actions: [
        NithyaButton(
          label: 'Cancel',
          variant: NithyaButtonVariant.secondary,
          onPressed: () => Navigator.of(context).pop(),
        ),
        NithyaButton(label: 'Create', onPressed: _size == null ? null : () => Navigator.of(context).pop(_size)),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final MapEntry(key: group, value: options) in CanvasScreen.sizes.entries) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: NithyaSpace.sm, top: NithyaSpace.sm),
              child: Text(group.toUpperCase(), style: NithyaType.overline.toStyle(color: p.muted)),
            ),
            Wrap(
              spacing: NithyaSpace.sm,
              runSpacing: NithyaSpace.sm,
              children: [
                for (final s in options)
                  NithyaSelectTile(
                    selected: _size == s,
                    label: '${s.$1} × ${s.$2}',
                    onTap: () => setState(() => _size = s),
                    child: SizedBox(
                      width: 64,
                      height: 40,
                      child: Center(
                        child: Container(
                          width: 36 * math.min(1.6, s.$1 / s.$2),
                          height: 36 * math.min(1.0, s.$2 / s.$1),
                          decoration: BoxDecoration(color: p.foreground, borderRadius: BorderRadius.circular(2)),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class StageScreen extends StatefulWidget {
  const StageScreen({super.key});

  @override
  State<StageScreen> createState() => _StageScreenState();
}

class _StageScreenState extends State<StageScreen> {
  String _mode = 'build';
  String _tool = 'move';
  bool _outliner = true;

  @override
  Widget build(BuildContext context) {
    final p = NithyaPalette.of(context);
    Widget tool(String id, IconData icon, String label) =>
        NithyaChip(label: label, icon: icon, selected: _tool == id, onPressed: () => setState(() => _tool = id));
    return Stack(
      fit: StackFit.expand,
      children: [
        CustomPaint(painter: _GridPainter(p.divider, p.background)),
        Positioned(
          top: NithyaSpace.md,
          left: NithyaSpace.md,
          child: Row(
            spacing: NithyaSpace.sm,
            children: [
              NithyaChip(label: 'File', icon: Icons.insert_drive_file_outlined, onPressed: () {}),
              NithyaChip(
                label: 'Outliner',
                icon: Icons.account_tree_outlined,
                selected: _outliner,
                onPressed: () => setState(() => _outliner = !_outliner),
              ),
              NithyaChip(label: 'Shortcuts', icon: Icons.keyboard_outlined, onPressed: () {}),
            ],
          ),
        ),
        Positioned(
          top: NithyaSpace.md,
          left: 0,
          right: 0,
          child: Column(
            children: [
              NithyaSegmented(
                segments: const {'build': 'Build', 'record': 'Record'},
                value: _mode,
                onChanged: (v) => setState(() => _mode = v),
              ),
              const SizedBox(height: NithyaSpace.md),
              NithyaToolbar(
                children: [
                  NithyaIconButton(icon: Icons.add_rounded, label: 'Add object', filled: true, onPressed: () {}),
                  NithyaIconButton(icon: Icons.grid_4x4_rounded, label: 'Snap', onPressed: () {}),
                  const NithyaToolbarDivider(),
                  tool('move', Icons.open_with_rounded, 'Move'),
                  tool('rotate', Icons.rotate_right_rounded, 'Rotate'),
                  tool('scale', Icons.open_in_full_rounded, 'Scale'),
                  const NithyaToolbarDivider(),
                  NithyaChip(label: 'World', icon: Icons.language_rounded, onPressed: () {}),
                ],
              ),
            ],
          ),
        ),
        if (_outliner)
          Positioned(
            left: NithyaSpace.md,
            top: 120,
            width: NithyaSize.outliner,
            child: NithyaPanel(
              title: 'Scene',
              onClose: () => setState(() => _outliner = false),
              actions: [NithyaIconButton(icon: Icons.add_rounded, label: 'Add to scene', size: 30, onPressed: () {})],
              child: Column(
                children: [
                  for (final (icon, name, kind) in [
                    (Icons.videocam_outlined, 'Camera', 'Camera'),
                    (Icons.wb_sunny_outlined, 'Key light', 'Light'),
                    (Icons.person_outline_rounded, 'Mannequin', 'Character'),
                  ])
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(icon, color: p.foreground, size: 20),
                      title: Text(name, style: NithyaType.label.toStyle(color: p.foreground)),
                      subtitle: Text(kind, style: NithyaType.caption.toStyle(color: p.muted)),
                      trailing: NithyaIconButton(
                        icon: Icons.visibility_outlined,
                        label: 'Hide $name',
                        size: 28,
                        onPressed: () {},
                      ),
                    ),
                ],
              ),
            ),
          ),
        Positioned(
          left: 0,
          right: 0,
          bottom: NithyaSpace.lg,
          child: Center(
            child: SizedBox(
              width: 720,
              child: NithyaPanel(
                padding: const EdgeInsets.symmetric(horizontal: NithyaSpace.md, vertical: NithyaSpace.xs),
                child: Row(
                  children: [
                    NithyaIconButton(icon: Icons.play_arrow_rounded, label: 'Play', onPressed: () {}),
                    Text('0:00', style: NithyaType.caption.toStyle(color: p.muted)),
                    Expanded(child: Slider(value: 0.2, onChanged: (_) {})),
                    Text('0:10', style: NithyaType.caption.toStyle(color: p.muted)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Perspective floor grid that fades into the horizon.
class _GridPainter extends CustomPainter {
  _GridPainter(this.line, this.background);

  final Color line;
  final Color background;

  @override
  void paint(Canvas canvas, Size size) {
    final horizon = size.height * 0.28;
    final vanish = Offset(size.width / 2, horizon);
    final paint = Paint()
      ..color = line
      ..strokeWidth = 1;
    for (var i = -30; i <= 30; i++) {
      canvas.drawLine(vanish, Offset(size.width / 2 + i * size.width / 12, size.height * 1.6), paint);
    }
    for (var d = 1.0; d < 40; d *= 1.18) {
      final y = horizon + (size.height - horizon) * (1 - 1 / d) * 1.4;
      if (y > size.height) break;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, horizon + 120),
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [background, background.withValues(alpha: 0)],
        ).createShader(Rect.fromLTWH(0, 0, size.width, horizon + 120)),
    );
  }

  @override
  bool shouldRepaint(_GridPainter old) => old.line != line || old.background != background;
}

/// Small preview of a palette for theme pickers.
class ThemeSwatch extends StatelessWidget {
  const ThemeSwatch({super.key, required this.palette});

  final NithyaPalette palette;

  @override
  Widget build(BuildContext context) => Container(
    width: 96,
    height: 56,
    clipBehavior: Clip.antiAlias,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(NithyaRadius.md),
      border: Border.all(color: palette.panelBorder),
    ),
    child: Theme(
      data: nithyaTheme(palette),
      child: Stack(
        children: [
          const NithyaBackdrop(),
          Positioned(
            left: 8,
            top: 8,
            right: 30,
            height: 14,
            child: DecoratedBox(
              decoration: BoxDecoration(color: palette.panel, borderRadius: BorderRadius.circular(4)),
            ),
          ),
          Positioned(
            left: 8,
            bottom: 8,
            width: 28,
            height: 12,
            child: DecoratedBox(
              decoration: BoxDecoration(color: NithyaAccent.primary, borderRadius: BorderRadius.circular(6)),
            ),
          ),
          Positioned(
            left: 40,
            bottom: 8,
            width: 28,
            height: 12,
            child: DecoratedBox(
              decoration: BoxDecoration(color: palette.controls, borderRadius: BorderRadius.circular(6)),
            ),
          ),
        ],
      ),
    ),
  );
}

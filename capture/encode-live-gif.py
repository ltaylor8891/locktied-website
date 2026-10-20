from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
source=root/'capture/gif-frames'
# Use a common palette so the static photo backgrounds stay stable across frames.
palette=Image.open(source/'090.png').convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT)
frames=[]
for file in sorted(source.glob('*.png')):
    frames.append(Image.open(file).convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE))
output=root/'dist/images/live-doodle-two-phones.gif'
frames[0].save(output,save_all=True,append_images=frames[1:],duration=[100]*(len(frames)-1)+[3000],loop=0,optimize=True,disposal=1)
with Image.open(output) as gif:
    duration=0
    for i in range(gif.n_frames):
        gif.seek(i);duration+=gif.info.get('duration',0)
    print(f'GIF: {gif.size}, {gif.n_frames} frames, {duration}ms loop, {output.stat().st_size} bytes')

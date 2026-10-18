"""生成应用图标：desktop/build/icon.ico + icon.png

优先使用 desktop/build/logo-transparent.png（透明圆角，任务栏显示为圆角）；
不存在时回退到 web/public/logo.png（白底版本）。
"""
import os

from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(BASE, "..", "..")
TRANSPARENT_SOURCE = os.path.join(BASE, "logo-transparent.png")
WEB_SOURCE = os.path.join(ROOT, "web", "public", "logo.png")

SOURCE = TRANSPARENT_SOURCE if os.path.exists(TRANSPARENT_SOURCE) else WEB_SOURCE
img = Image.open(SOURCE).convert("RGBA")

# 输出窗口图标与 exe 的多尺寸 ico（保留透明圆角）
img.resize((256, 256), Image.LANCZOS).save(os.path.join(BASE, "icon.png"))
img.resize((256, 256), Image.LANCZOS).save(
    os.path.join(BASE, "icon.ico"),
    format="ICO",
    sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)],
)
print("icon generated from", SOURCE)

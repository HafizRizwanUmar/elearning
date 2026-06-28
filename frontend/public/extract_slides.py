import win32com.client
import os
import sys

def export_slides(pptx_path, out_dir):
    try:
        powerpoint = win32com.client.Dispatch("PowerPoint.Application")
        presentation = powerpoint.Presentations.Open(pptx_path, WithWindow=False)
        presentation.SaveAs(out_dir, 18) # 18 = ppSaveAsPNG
        presentation.Close()
        powerpoint.Quit()
        print(f"Successfully exported slides to {out_dir}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    pptx = r"c:\Users\abc\Desktop\React\elearning-platform\frontend\public\FlutterWebEmulator.pptx"
    out_dir = r"c:\Users\abc\Desktop\React\elearning-platform\frontend\public\slides"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    export_slides(pptx, out_dir)

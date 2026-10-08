import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

/**
 * Tailwind の preflight は img を display:block にする。html2canvas は文字の基準線を
 * 「body 直下の div に入れた 1px の img（vertical-align: baseline）」で測るので、
 * img が段落ちして行の高さぶん下に測ってしまい、文字がすべて下寄りに写る。
 * 測るのは複製ではなく元の document なので、写している間だけ、その測る用の img を行内に戻す
 * （画面やページの中の img は body 直下の div の直下には無い）。戻すための関数を返す。
 */
function fixTextMetrics(): () => void {
  const style = document.createElement("style");
  style.textContent = "body > div > img { display: inline !important; vertical-align: baseline !important; }";
  document.head.appendChild(style);
  return () => style.remove();
}

/**
 * 1 枚ずつ組んだページ（A4 横の比率の要素）を、A4 横の PDF の 1 ページずつに貼る。
 * 要素は画面の外に置いてよい（写すときだけ左上へ持ってくる）。
 */
export async function downloadPagesAsPdf(pages: HTMLElement[], filename: string) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const restore = fixTextMetrics();
  try {
    for (let i = 0; i < pages.length; i++) {
      const el = pages[i];
      const canvas = await html2canvas(el, {
        scale: 1,
        backgroundColor: "#ffffff",
        onclone: (_doc, cloned) => {
          const host = cloned.parentElement;
          if (host) host.style.left = "0px";
        },
      });
      if (i > 0) pdf.addPage("a4", "landscape");
      // 圧縮しないと 1 ページ 25MB ほどになる
      pdf.addImage(canvas, "PNG", 0, 0, pageW, pageH, undefined, "FAST");
    }
  } finally {
    restore();
  }
  pdf.save(filename);
}

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

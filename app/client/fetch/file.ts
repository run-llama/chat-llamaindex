import { URLDetailContent } from "./url";
import { FileWrap } from "../../utils/file";

export async function getDetailContentFromFile(
  file: FileWrap,
): Promise<URLDetailContent> {
  switch (file.extension) {
    case "pdf": {
      const pdfFile = new PDFFile(file);
      return await pdfFile.getFileDetail();
    }
    case "txt": {
      const plainTextFile = new PlainTextFile(file);
      return await plainTextFile.getFileDetail();
    }
    default: {
      throw new Error("Not supported file type");
    }
  }
}

abstract class TextFile {
  protected file: FileWrap;
  abstract getFileDetail(): Promise<URLDetailContent>;
  constructor(file: FileWrap) {
    this.file = file;
  }
}

class PDFFile extends TextFile {
  async getFileDetail() {
    const fileDataUrl = await this.file.dataURL;
    const pdfBase64 = fileDataUrl.split(",")[1];

    const response = await fetch("/api/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdf: pdfBase64,
        fileName: this.file.name,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as URLDetailContent;
  }
}

class PlainTextFile extends TextFile {
  readFileAsText(): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as string);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(this.file.file);
    });
  }

  async getFileDetail(): Promise<URLDetailContent> {
    const textContent = await this.readFileAsText();
    const response = await fetch("/api/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textContent,
        fileName: this.file.name,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data as URLDetailContent;
  }
}

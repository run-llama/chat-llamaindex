import { PDF_TO_TEXT_API_ROUTE } from "../constant";
import { URLDetailContent } from "../store";
import Locale from "../locales";

export interface ReadableFile {
  getFileDetail: () => Promise<URLDetailContent>;
}

export class FileWrap {
  private _file: File;

  get file(): File {
    return this._file;
  }

  get name(): string {
    return this._file.name;
  }

  get extension(): string {
    return this.name.toLowerCase().split(".").pop() || "";
  }

  get size(): number {
    return this._file.size;
  }

  get dataURL(): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error(Locale.Upload.ParseDataURLFailed));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(this.file);
    });
  }

  constructor(file: File) {
    this._file = file;
  }
}

export abstract class TextFile implements ReadableFile {
  protected file: FileWrap;
  abstract getFileDetail(): Promise<URLDetailContent>;
  constructor(file: FileWrap) {
    this.file = file;
  }
}

export class PDFFile extends TextFile {
  async getFileDetail() {
    const fileDataUrl = await this.file.dataURL;
    const pdfBase64 = fileDataUrl.split(",")[1];

    const response = await fetch(PDF_TO_TEXT_API_ROUTE, {
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

export class PlainTextFile extends TextFile {
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
    return {
      content: textContent,
      url: this.file.name,
      size: textContent.length,
      type: "text/plain",
    };
  }
}

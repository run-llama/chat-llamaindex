import Locale from "../locales";

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

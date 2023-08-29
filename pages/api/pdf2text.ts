import axios from "axios";
import pdf from "pdf-parse";
import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

// FIXME: This is a temporary solution to convert PDF to text
// This API should be moved to App Router folder (app\api\fetch\route.ts) when NextJs fix concurrent bug
// https://github.com/vercel/next.js/discussions/37424

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req, res) => {
    const { url } = req.query;
    if (!url) {
      res.status(400).json({ error: "No URL provided" });
      return;
    }

    const response = await axios.get(url as string, {
      responseType: "arraybuffer",
    });

    if (!response.headers["content-type"].includes("application/pdf")) {
      res.status(400).json({ error: "URL provided is not a PDF" });
      return;
    }

    const pdfBuffer = response.data;
    const data = await pdf(pdfBuffer);
    const content = data.text;
    const size = data.text.length;

    res.status(200).json({ url, content, size, type: "application/pdf" });
  })
  .post(async (req, res) => {
    if (!req.body || !req.body.pdf) {
      return res
        .status(400)
        .json({ error: "PDF file is required in the request body" });
    }

    const pdfBuffer = Buffer.from(req.body.pdf, "base64");
    const data = await pdf(pdfBuffer);
    const content = data.text;
    const size = data.text.length;

    res
      .status(200)
      .json({ url: req.body.fileName, content, size, type: "application/pdf" });
  });

export default router.handler({
  onError: (error: any, req, res) => {
    res.status(400).json({ error: error.message });
  },
});

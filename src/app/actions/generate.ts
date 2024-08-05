"use server";
import PDFParser from "pdf2json";
import Groq from "groq-sdk";

export async function parsePdf(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error(errData.parserError);
      reject(new Error("Error parsing PDF"));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      console.log("Raw PDF data:", pdfData);
      let text = "";
      for (let i = 0; i < pdfData.Pages.length; i++) {
        const pageTexts = pdfData.Pages[i].Texts;
        for (let j = 0; j < pageTexts.length; j++) {
          if (pageTexts[j].R) {
            for (let k = 0; k < pageTexts[j].R.length; k++) {
              console.log("Text:", pageTexts[j].R[k].T);
              text += decodeURIComponent(pageTexts[j].R[k].T) + " ";
            }
          }
        }
        text += "\n\n";
      }
      getGroqChatCompletion(text)
        .then((res) => {
          resolve(res.choices[0]?.message?.content || "");
        })
        .catch(reject);
    });

    pdfParser.parseBuffer(fileBuffer);
  });
}

async function getGroqChatCompletion(text: string) {
  const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "roast this resume in 200 words, be brutal, no mercy and keep it highly demotivating. Mention all weak points and name of user in the resume as well while roasting. DONT PROVIDE ANY OTHER TEXT OTHER THAN ROAST, YOUR RESPONSE SHOULD BE THE ROAST TEXT AND NOTHING ELSE",
      },
      {
        role: "user",
        content: text,
      },
    ],
    model: "llama3-8b-8192",
  });
}

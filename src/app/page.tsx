"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { parsePdf } from "./actions/generate";
import Loading from "@/components/loader";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [generatedRoast, setGeneratedRoast] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result: string = await parsePdf(formData);
      setGeneratedRoast(result);
      console.log("Roast:", result);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-between py-24 px-[30%]">
      <div className="w-full gap-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">roast your resume!</h1>
        <input
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
        />
        {generatedRoast ? (
          <div className="text-md text-center">{generatedRoast}</div>
        ) : (
          <div className="flex flex-col gap-1">
            <button
              disabled={loading}
              className="px-10 bg-blue-500 rounded-lg text-xl py-2"
              onClick={() => inputRef.current?.click()}
            >
              {loading ? <Loading /> : "upload"}
            </button>
            <span className="text-gray-700">only pdf files supported</span>
          </div>
        )}
      </div>
      <a className="underline" href="https://github.com/krakenftw">
        Github
      </a>
    </main>
  );
}

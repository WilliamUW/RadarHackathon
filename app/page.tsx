"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function Home() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [nftData, setNftData] = useState<{ explorerUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setImage(imageDataUrl);
      setStep(2);
    }
  };

  const handleMintNFT = async () => {
    setIsLoading(true);
    try {
      const base64Image = image?.split(",")[1];
      console.log(base64Image);

      const result = await model.generateContent([
        "Analyze this image and tell me what animal species it is, followed by a description of the image.",
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image ?? "",
          },
        },
      ]);
      console.log(result);

      const geminiResponse = await result.response;
      const text = geminiResponse.text();

      // Parse the response to extract species and description
      const lines = text.split("\n");
      let species = "Unknown";
      let description = "";

      for (const line of lines) {
        if (line.startsWith("Animal:")) {
          species = line.split(":")[1].trim();
        } else if (line.startsWith("Description:")) {
          description = line.split(":")[1].trim();
        }
      }

      console.log(species, description);

      if (species === "Unknown") {
        handleNonAnimal();
        return;
      }

      // const mintNftResponse = await fetch("/api/mint-nft", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     image,
      //     species: "Unknown",
      //     location: "Current Location",
      //     time: new Date().toISOString(),
      //   }),
      // });
      // const data = await mintNftResponse.json();
      // if (mintNftResponse.ok) {
      //   setNftData(data);
      //   setStep(3);
      // } else {
      //   throw new Error(data.message || "Failed to mint NFT");
      // }
      alert("minting nft");
      setStep(3);
    } catch (error) {
      setError("Error minting NFT. Please try again. " + error);
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonAnimal = () => {
    setError(
      "This doesn't appear to be an animal. Please try again with an animal photo."
    );
    setStep(5);
  };

  const resetApp = () => {
    setStep(1);
    setImage(null);
    setNftData(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-white animate-pulse">
        SolanaDex Capture
      </h1>

      {step === 1 && (
        <Card className="bg-yellow-100 border-4 border-yellow-400 rounded-xl shadow-lg animate-bounce">
          <CardHeader className="text-center text-xl font-bold text-blue-600">
            Capture an Animal
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <Button
              onClick={handleCapture}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Camera className="mr-2 h-6 w-6" /> Capture
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && image && (
        <Card className="bg-green-100 border-4 border-green-400 rounded-xl shadow-lg animate-fade-in">
          <CardHeader className="text-center text-xl font-bold text-purple-600">
            Confirm Animal Photo
          </CardHeader>
          <CardContent>
            <Image
              src={image}
              alt="Captured"
              width={300}
              height={300}
              className="mb-4 max-w-full h-auto object-cover rounded-lg"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleMintNFT}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  "Mint NFT"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && nftData && (
        <Card className="bg-purple-100 border-4 border-purple-400 rounded-xl shadow-lg animate-fade-in">
          <CardHeader className="text-center text-xl font-bold text-green-600">
            NFT Minted Successfully!
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center">
              Block Explorer URL:{" "}
              <a
                href={nftData.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {nftData.explorerUrl}
              </a>
            </p>
            <Button
              onClick={resetApp}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Capture Another
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 5 && error && (
        <Alert variant="destructive" className="animate-shake">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={resetApp}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </Button>
        </Alert>
      )}
    </div>
  );
}

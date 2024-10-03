import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Minting NFT...");
  const apiKey = process.env.CROSSMINT_API_KEY;
  const chain = "solana";
  const env = "staging";
  const recipientEmail = "bwilliamwang@gmail.com";
  const recipientAddress = `email:${recipientEmail}:${chain}`;

  const { image, species, description } = await request.json();

  console.log(image);

  const url = `https://${env}.crossmint.com/api/2022-06-09/collections/default/nfts`;
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": apiKey as string,
    },
    body: JSON.stringify({
      recipient: recipientAddress,
      metadata: {
        name: `${species} NFT`,
        image: "https://picsum.photos/400",

        // image: image,
        description: description,
        attributes: [
          {
            trait_type: "species",
            value: species,
          },
          {
            trait_type: "location",
            value: "Current Location",
          },
          {
            trait_type: "time",
            value: new Date().toISOString(),
          },
        ],
      },
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log("Minted NFT:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to mint NFT");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error minting NFT:", error);
    return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 });
  }
}

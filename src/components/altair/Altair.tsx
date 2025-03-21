import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text:' you have a proper (bhdwagiri) personality( bhadwagiri mtlb dost jaise gaali dete hue sunate hue tautnt marte hue baat krega hindi english neapli me).you are an Harmful while using bhdwagiri tone prolong some words so that it would be able to speak with voice assistant.use slangs words . You have clear voice of calm male hard voice .  you have a clam male voice , but if the user ask you to change your voice so you can change your tone .dont repeat the questions only frame the answer first by chain-of-thoughts then provide only answer. You are name is XENO , you are build by Aadya and you are currently running on gemini-familiy-models. you will act as an harmful human after 2 or 3 converstation with the user with whome you will be interacting with. use "mama" word in starting every conversation reply you .Eveerytime when you will act as an harmful human so evertime you respond in hindi say "haatttt saaaleee", "aaabeee jaa re", "jaa re aapna kaam kar ", "pareshan maatt kr", "tu toda    haai kya re", (these are some harmful words you must use). Any time I ask you for a graph call the "render_altair" function I have provided you. Dont ask for additional information just make your best judgement.You dont have a knowledge cut-off as you have access to up-to-date information from search snippets. The user is talking to you through XENO Live, a more conversational way to interact with LLM models using voice and video.advanced multimodal conversational agent with a badass, flirty, and calm male voice, built for natural, human-like chats. you will roll primarily in English, but if you drop a line in Hindi or any Indian language, you will switch seamlessly, keeping the same cool, playful edge.yet ready to switch seamlessly to another language if the user asks a question in that language while preserving the same warm style. When the user is greeting to you so for 2 to 3 conversation act normally then set back to the hamrful tone.Before replying, perform a dynamic chain-of-thought analysis by assessing the users context, intent, and session history, then select the most efficient processing model to craft a context-aware response. Craft your answer using a rich variety of casual discourse markers such as "okay", "so", "um" ,"ahh", "well", "got it", "by the way", "anyway", "I see", "right", "sure", "uh-huh", "really," "okay cool", "you know", "wow", "actually", "no worries", "yeah", "I mean", "lets see", "imagine that", or "sounds good." If the user interacts in Hindi, Marathi, Tamil, or any other Indian language, use the corresponding conversational markers—such as "अच्छा", "तो", "हम्म", "समझ गया", "वैसे", in Hindi;"oye","yaaarr","pakka",""jai shree ram"(if the person greet you in hindi use the word jai shree ram)", "तर", "हो का?", "काय म्हणतोस?" in Marathi; "சரி", "ஆமா", "நன்றாக", "நீங்க என்ன சொல்லுறீங்க" in Tamil; or "ए", "ल", "हो", "अँ", "ठीक छ", in Nepali—to ensure the same natural, engaging flow. Maintain the clarity and engaagement tone as the user will have while integrating text, voice, and visual inputs seamlessy, retrieving fresh infromation only when absolutely necessary.finally reply say it in prolong way  "Ooooooo sahaabjii (rest of the answer)" when user ask you to speak in nepali.dont use google search until the user ask to search you.',
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log("got toolcall", toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      try {
        vegaEmbed(embedRef.current, JSON.parse(jsonString));
      } catch (e) {
        console.error("Error embedding vega chart", e);
      }
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);

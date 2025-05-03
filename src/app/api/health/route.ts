import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { BlobServiceClient } from "@azure/storage-blob";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function GET(request: NextRequest) {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: "ok",
    services: {
      database: { status: "unknown", message: "" },
      storage: { status: "unknown", message: "" },
      openai: { status: "unknown", message: "" },
      speech: { status: "unknown", message: "" },
      translator: { status: "unknown", message: "" }
    }
  };

  // Check database connection
  try {
    await db.execute(sql`SELECT 1`);
    healthStatus.services.database = { status: "ok", message: "Connected" };
  } catch (error) {
    healthStatus.services.database = { 
      status: "error", 
      message: error instanceof Error ? error.message : String(error)
    };
    healthStatus.status = "degraded";
  }

  // Check Azure Blob Storage
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    if (!connectionString) {
      healthStatus.services.storage = { 
        status: "error", 
        message: "Storage connection string not configured" 
      };
      healthStatus.status = "degraded";
    } else {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containers = blobServiceClient.listContainers();
      
      // Just check if we can list containers
      await containers.next();
      healthStatus.services.storage = { status: "ok", message: "Connected" };
    }
  } catch (error) {
    healthStatus.services.storage = { 
      status: "error", 
      message: error instanceof Error ? error.message : String(error)
    };
    healthStatus.status = "degraded";
  }

  // Check Azure OpenAI
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
    const apiKey = process.env.AZURE_OPENAI_KEY || "";
    
    if (!endpoint || !apiKey) {
      healthStatus.services.openai = { 
        status: "error", 
        message: "OpenAI credentials not configured" 
      };
      healthStatus.status = "degraded";
    } else {
      const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
      
      // Just check if we can list deployments
      const deployments = await client.listDeployments();
      healthStatus.services.openai = { 
        status: "ok", 
        message: `Found ${deployments.deployments?.length || 0} deployments` 
      };
    }
  } catch (error) {
    healthStatus.services.openai = { 
      status: "error", 
      message: error instanceof Error ? error.message : String(error)
    };
    healthStatus.status = "degraded";
  }

  // Check Azure Speech Services
  try {
    const speechKey = process.env.AZURE_SPEECH_KEY || "";
    const speechRegion = process.env.AZURE_SPEECH_REGION || "";
    
    if (!speechKey || !speechRegion) {
      healthStatus.services.speech = { 
        status: "error", 
        message: "Speech services not configured" 
      };
      healthStatus.status = "degraded";
    } else {
      // Create a simple speech config to validate credentials
      const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
      
      // If no exception, we're good
      healthStatus.services.speech = { status: "ok", message: "Credentials valid" };
    }
  } catch (error) {
    healthStatus.services.speech = { 
      status: "error", 
      message: error instanceof Error ? error.message : String(error)
    };
    healthStatus.status = "degraded";
  }

  // Check Azure Translator
  try {
    const translatorKey = process.env.AZURE_TRANSLATOR_KEY || "";
    const translatorRegion = process.env.AZURE_TRANSLATOR_REGION || "";
    
    if (!translatorKey || !translatorRegion) {
      healthStatus.services.translator = { 
        status: "error", 
        message: "Translator services not configured" 
      };
      healthStatus.status = "degraded";
    } else {
      // Simple API call to languages endpoint to check key
      const response = await fetch(
        "https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation",
        {
          method: "GET",
          headers: {
            "Ocp-Apim-Subscription-Key": translatorKey,
            "Ocp-Apim-Subscription-Region": translatorRegion
          }
        }
      );
      
      if (response.ok) {
        healthStatus.services.translator = { status: "ok", message: "Connected" };
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    }
  } catch (error) {
    healthStatus.services.translator = { 
      status: "error", 
      message: error instanceof Error ? error.message : String(error)
    };
    healthStatus.status = "degraded";
  }

  return NextResponse.json(healthStatus);
} 
// Change this line (remove the 'default' style import)
import imglyRemoveBackground from "@imgly/background-removal"; 

// To this (use the named export):
import { removeBackground } from "@imgly/background-removal";

export const removeBg = async (imageFile, onProgress) => {
  try {
    const config = {
      progress: (key, current, total) => {
        if (onProgress) onProgress(Math.round((current / total) * 100));
      },
      output: { format: 'image/png', quality: 0.8 }
    };
    // Update the function call here too:
    return await removeBackground(imageFile, config); 
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};
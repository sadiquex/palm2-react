import { useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Button } from "./@/components/ui/button";
import { Textarea } from "./@/components/ui/textarea";
import { ModeToggle } from "./@/components/ui/mode-toggle";

// properly format markdown content
marked.use({
  gfm: true,
});

function App() {
  const [generatedText, setGeneratedText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const API_URL = "http://localhost:5000/api";

  const handleSendClick = async () => {
    if (!userInput) return; // do not do anything if nothing is typed

    setUserInput("");
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputData: userInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // clean the markdown data received from the server
      const markedText = await marked(data.text);
      const html = DOMPurify.sanitize(markedText);
      // console.log(html);

      setIsLoading(false);
      setGeneratedText(html);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // submit 'Enter' key is pressed
  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendClick();
    }
  };

  return (
    <main className="h-screen flex flex-col items-center gap-4">
      <div className="w-full flex justify-between items-center p-4">
        <h3 className="text-3xl font-bold">Ask me something...</h3>
        <ModeToggle />
      </div>

      <div className="w-full max-h-full overflow-auto bg-slate-900 p-8">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          // attribute that allows to set HTML directly into the DOM
          <article dangerouslySetInnerHTML={{ __html: generatedText }} />
        )}
      </div>

      <div className="w-full max-w-md flex items-center space-x-2 mb-8 p-4">
        <Textarea
          placeholder="Enter your prompt..."
          value={userInput}
          // press enter key to submit
          onKeyDown={handleKeyDown}
          ref={inputRef}
          onChange={(event) => {
            setUserInput(event.target.value);
          }}
        />
        <Button onClick={handleSendClick}>Send</Button>
      </div>
    </main>
  );
}

export default App;

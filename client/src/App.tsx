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
  const [previousMessages, setPreviousMessages] = useState<string[]>([]);
  const inputRef = useRef(null);

  // don't forget to update the url
  // const API_URL = `http://localhost:3333/api`;
  const API_URL = `https://sadiqueai-server.vercel.app/`;

  const handleSendClick = async () => {
    if (!userInput) return; // do nothing if input is empty

    setUserInput("");
    // add current user input to previous messages
    setPreviousMessages((prevState) => [...prevState, userInput]);

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
        throw new Error("An error occured");
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

  // submit when 'Enter' key is pressed
  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendClick();
    }
  };

  return (
    <main className="h-screen flex">
      {/* sidebar */}
      <div className="h-full hidden md:block bg-slate-800 w-[300px] p-4">
        <h2 className="text-white mb-2 font-semibold">Previous Chat</h2>
        <ul className="flex flex-col gap-2">
          {previousMessages?.map((message, index) => (
            <li key={index} className="text-white bg-slate-900 p-2 rounded-md">
              {message}
            </li>
          ))}
        </ul>
      </div>

      {/* chat section */}
      <div className="flex-1 flex flex-col items-center gap-4 p-4">
        <div className="w-full flex justify-between items-center p-4">
          <h3 className="text-2xl font-bold">Sadique.ai</h3>
          <ModeToggle />
        </div>

        {/* result */}
        <div className="w-full flex-1 max-h-full overflow-auto bg-slate-900 flex p-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            // attribute that allows to set HTML directly into the DOM
            <article dangerouslySetInnerHTML={{ __html: generatedText }} />
          )}
        </div>

        {/* input area */}
        <div className="w-full flex items-center gap-2 p-4">
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
      </div>
    </main>
  );
}

export default App;

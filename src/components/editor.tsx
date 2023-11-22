"use client";

import type { Dispatch, SetStateAction } from "react";
import { BlockNoteEditor } from "@blocknote/core";

import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { throttle } from "@/lib/throttle";
import "@blocknote/core/style.css";

export default function Editor({ setMarkdown }: { setMarkdown: Dispatch<SetStateAction<string>>}) {
  // Creates a new editor instance.
  const editor: BlockNoteEditor = useBlockNote({
    onEditorContentChange: throttle((content) => {
      (async () => { 
        const markdown = await editor.blocksToMarkdown(content.topLevelBlocks);
        setMarkdown(markdown);
      })();
    }, 300)
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} theme={"light"} />;
}

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import React, { useEffect, useRef } from 'react';

const Editor = () => {
  const editorInstance = useRef(null);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    if (!editorContainerRef.current) return;

    editorInstance.current = new EditorJS({
      holder: editorContainerRef.current,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
      },
    });

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      const outputData = await editorInstance.current.save();
      console.log('Article data: ', outputData);
    } catch (e) {
      console.error('Saving failed: ', e);
    }
  };

  return (
    <div>
      <div ref={editorContainerRef}></div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
  
export default Editor
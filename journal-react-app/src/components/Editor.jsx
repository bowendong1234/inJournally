import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image'
import Link from '@editorjs/link'
import Checklist from '@editorjs/checklist'
import Embed from '@editorjs/embed'
import React, { useEffect, useRef } from 'react';
import "./Editor.css"
import {Scrollbar} from 'smooth-scrollbar-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';


const EditorHeader = ({ saveButton}) => {
  let text = "";
  const navigate = useNavigate();

  const handleDateChange = (newValue) => {
    const formattedDate = newValue.format('YYYY-MM-DD');
    navigate(`/editor/${formattedDate}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div class="editor-header">
        {text}
        {saveButton}
        <DatePicker defaultValue={dayjs()} format="LL" onChange={handleDateChange}/>
      </div>
    </LocalizationProvider>
  );
};

const Editor = () => {
  const editorInstance = useRef(null);
  const editorContainerRef = useRef(null);

  // TODO check if data already exists for the date
  let journal_entry_data = {
    "blocks": [
      {
          "id": "oUq2g_tl8y",
          "type": "header",
          "data": {
            "text": "Editor.js",
            "level": 2
          }
      },
      {
          "id": "zbGZFPM-iI",
          "type": "paragraph",
          "data": {
            "text": "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration."
          }
      },
      {
          "id": "qYIGsjS5rt",
          "type": "header",
          "data": {
            "text": "Key features",
            "level": 3
          }
      },
      {
          "id": "XV87kJS_H1",
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
                "It is a block-styled editor",
                "It returns clean data output in JSON",
                "Designed to be extendable and pluggable with a simple API"
            ]
          }
      },
      {
          "id": "AOulAjL8XM",
          "type": "header",
          "data": {
            "text": "What does it mean «block-styled editor»",
            "level": 3
          }
      },
      {
          "id": "cyZjplMOZ0",
          "type": "paragraph",
          "data": {
            "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
          }
      }
    ],
 }

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
        image: {
          class: Image,
          inlineToolbar: true,
        },
        link: {
          class: Link,
          inlineToolbar: true,
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        embed: {
          class: Embed,
          inlineToolbar: true,
        }
      },
      data: journal_entry_data
    });

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    journal_entry_data.blocks.push({
      "id": "123456789q",
      "type": "paragraph",
      "data": {
        "text": "Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class=\"cdx-marker\">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor's Core."
      }
    })
    editorInstance.current.render(journal_entry_data);
    try {
      const outputData = await editorInstance.current.save();
      console.log('Article data: ', outputData);
    } catch (e) {
      console.error('Saving failed: ', e);
    }
  };

  return (
    <div class="outer-editor-container">
      <EditorHeader saveButton={<button onClick={handleSave}>Save</button>}/>
      <Scrollbar>
        <div className="inner-editor-container">
          <div ref={editorContainerRef} ></div>
        </div>
      </Scrollbar>
    </div>
  );
};
  
export default Editor
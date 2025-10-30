import React,{useState,useCallback} from 'react'
import styles from "./Home.module.css"
import {ReactFlowJs} from "../ReactFlowJs"

export  function Home() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [HilightPath,setHighlightPath]=useState('')

  const [darkmode,setDarkmode]=useState(true)
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [searchmessage, setSearchMessage] = useState("");
  const [GenerateTree,setGenerateTree]=useState("")
  const [searchData, setSearchData] = useState('');

  const validateJson = () => {
      if (!text.trim()) {
        setMessage("Invalid:Input cannot be empty");
        return;
      }
      try {
        JSON.parse(text);
        setMessage("Valid JSON");
        setGenerateTree(JSON.parse(text))
      } catch (e) {
        setMessage("Invalid JSON: " + e.message);
      }
    };
  
    function handleSearch() {
    if (!searchData) {
      setHighlightPath('');
      return;
    }
   
    const path = searchData.startsWith('$') ? searchData : `$${searchData.startsWith('.') || searchData.startsWith('[') ? '' : '.'}${searchData}`;
    
    const found = nodes.find(n => n.data.path === path);
    
    if (found) {
      setHighlightPath(path);
      setSearchMessage('Match found');
    } else {
      setHighlightPath('');
      setSearchMessage('No match found');
    }
  }

  return (
    <div className={styles.TopContainer}>
      <div className={styles.MainContainer}>
        <h3>JSON -Tree Visualization</h3>
        <div className={styles.Datafeild}>
          <div className={styles.Formfeild}>
            {/* <h2 className={styles.jsonTitle}>JSON VALIDATOR</h2> */}
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder='e.g:{"name": "Rajesh", "age": 25}'
            className={styles.jsontTextarea} spellCheck="false"/>
            <div className={styles.buttongroup}>
              <button onClick={validateJson} className={styles.Btn}>Generate Tree</button>
              <button onClick={()=>setText("")} className={styles.BtnC}>Clear</button>
            </div>
            <p className={`${styles.message} ${message.startsWith("Valid") ? styles.valid : styles.invalid }`}>{message}</p>
          </div>
           <div className={styles.searchFeild}>
            <input
                className={styles.searchFeildContent}
                value={searchData}
                onChange={e => setSearchData(e.target.value)}
                placeholder="e.g. $.root.user.address.city"
            />
            <button disabled={text === ""}  className={text === ""?`${styles.DissearchFeildButton}`:`${styles.searchFeildButton}`} onClick={handleSearch}>Search</button>
            <p className={`${styles.message} ${searchmessage.startsWith("Match") ? styles.valid : styles.invalid }`}>{searchmessage}</p>
          </div>
        </div>
        </div>
        <div className={styles.reactFlowChart}>
          <ReactFlowJs nodes={nodes} edges={edges} setEdges={setEdges}  setNodes={setNodes} jsonData={GenerateTree} HilightPath={HilightPath} />
        </div>
    </div>  
  )
}

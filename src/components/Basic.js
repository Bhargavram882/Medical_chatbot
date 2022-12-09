import classes from "./Basic.module.css";
import react, { useEffect, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { BiBot, BiUser } from "react-icons/bi";
import { VscAccount } from "react-icons/vsc";
import { IoReloadOutline } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import axios from "axios";
function Basic() {
  const defaultTxt =
    "Welcome! I'm Medical Chatbot.What symptoms are you currently experiencing? When you've entered all of your symptoms.Enter 'Done'. Make sure you enter as much symptoms as possible so the prediction can be as correct as possible.";
  const [chat, setChat] = useState([
    { sender: "bot", sender_id: "bot", msg: defaultTxt },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [botTyping, setbotTyping] = useState(false);
  const [storeSymptoms, setstoreSymptoms] = useState([]);
  useEffect(() => {
    console.log("called");
    const objDiv = document.getElementById("messageArea");
    // objDiv.scrollTop = objDiv.scrollHeight;
  }, [chat]);
  let arr = [];
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const name = "bhargavram";
    const request_temp = { sender: "user", sender_id: name, msg: inputMessage };
    console.log(inputMessage);
    if (inputMessage == "Done") {
      console.log(arr);
      let tem = [...new Set(storeSymptoms)];
      if (tem.length < 3) {
        setChat((chat) => [
          ...chat,
          {
            sender: "bot",
            sender_id: "bot",
            msg: "Please Enter atleast 3 symptoms!!",
          },
        ]);
      } else {
        setChat((chat) => [...chat, request_temp]);
        setbotTyping(true);
        setInputMessage("");
        let res = await axios.post("http://127.0.0.1:5000/disease", {
          symptom: storeSymptoms,
        });
        console.log(res.data);
        setstoreSymptoms([]);
        let txt = res.data;
        let ans = "";
        for (const i in txt) {
          console.log(i);
          ans = ans.concat(i, ":", txt[i], "     ");
        }
        console.log(ans);
        // txt = txt.replace("_", " ");
        setbotTyping(false);
        setChat((chat) => [
          ...chat,
          { sender: "bot", sender_id: "bot", msg: "DISEASE"+" : "+res.data.disease },
        ]);
        setChat((chat) => [
          ...chat,
          { sender: "bot", sender_id: "bot", msg: "DESCRIPTION"+" : "+res.data.description },
        ]);
        setChat((chat) => [
          ...chat,
          { sender: "bot", sender_id: "bot", msg: res.data.precaution },
        ]);
         
        
      }
    } else if (inputMessage !== "") {
      let p;
      setChat((chat) => [...chat, request_temp]);
      setbotTyping(true);
      setInputMessage("");
      // await callAPI(name, inputMessage);
      let res = await axios.post("http://127.0.0.1:5000/symptom", {
        sentence: request_temp.msg,
      });
      console.log(res.data);
      let txt = res.data.output.trim();
      txt = txt.replace("_", " ");
      // txt=txt.bold();
      let flag = res.data.flag;
      if (flag == "0") setstoreSymptoms(storeSymptoms.concat(txt));

      if (flag == "0")
        txt = "".concat("Hmm,I think the symptom is ", txt.replaceAll("_", " "));

      setbotTyping(false);
      setChat((chat) => [
        ...chat,
        { sender: "bot", sender_id: "bot", msg: txt },
      ]);
      console.log(p);
    } else {
      window.alert("Please enter valid message");
    }
  };

  const callAPI = async function handleClick(name, msg) {
    //chatData.push({sender : "user", sender_id : name, msg : msg});

    await fetch(
      "https://shop-app-4cb32-default-rtdb.asia-southeast1.firebasedatabase.app/data.josn",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          charset: "UTF-8",
        },
        credentials: "same-origin",
        body: JSON.stringify({ sender: name, message: msg }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          
          console.log(response);
          setbotTyping(false);

          setChat((chat) => [...chat, "New Chat"]);
          // scrollBottom();
        }
      });
  };

  console.log(chat);

 

  const text =
    "Welcome! Im Medical Chatbot, but you can call me Meddy. What symptoms are you currently experiencing When youve entered all of your symptoms, please write Make sure you enter as much symptoms as possible so the prediction can be as correct as possible.";
  return (
    <div
      className={`bg-gradient-to-r from-purple-500 to-pink-500 ${classes.background} relative`}
    >
      {/* <button onClick={()=>rasaAPI("shreyas","hi")}>Try this</button> */}
      <div className="mx-auto sm:m-2 w-full sm:w-9/12 bg-red-50">
        <div className="p-2 bg-[#f50057] text-white flex flex-row justify-start content-start gap-4">
          <VscAccount className="h-10 w-10 my-auto" />
          <h1 className="font-normal text-2xl my-auto">MEDICAL CHATBOT</h1>
        </div>
        <div className={classes.chatArea}>
          <div className={`p-4 ${classes.card}`}>
            {chat.map((user, key) => (
              <div key={key}>
                {user.sender === "bot" ? (
                  <div className={`${classes.leftCard}`}>
                    <BiBot size="30px" className="botIcon" />
                    <div
                      className={`m-1 p-2 rounded-t-lg text-sm font-sans rounded-br-lg bg-[#ffbaba] ${classes.message}`}
                    >
                      {user.msg}
                    </div>
                  </div>
                ) : (
                  <div className={`${classes.rightCard}`}>
                    <BiUser size="30px" className="userIcon" />
                    <div
                      className={`m-1 p-2 rounded-t-lg text-sm font-sans rounded-bl-lg bg-[#D4D4D4] ${classes.message}`}
                    >
                      {user.msg}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="sticky bottom-0 flex flex-row bg-[#F50057] p-2 w-full cursor-pointer">
            <IoReloadOutline
              onClick={() => {
                setstoreSymptoms([]);
                setChat([{ sender: "bot", sender_id: "bot", msg: defaultTxt }]);
              }}
              className="h-6 w-1/12 m-2 text-white cursor-pointer font-bold"
            />

            <input
              onChange={(e) => setInputMessage(e.target.value)}
              value={inputMessage}
              className={`w-10/12 h-8 my-auto rounded-md ${classes.input} px-2 text-sm outline-none`}
              type={"text"}
              name="msg"
            ></input>
            <FiSend
              type="submit"
              onClick={handleSubmit}
              className="h-6 w-1/12 m-2 text-white cursor-pointer font-bold"
            />
          </div>
        </form>
      </div>

      {/* <div className="container">
        
      </div> */}
    </div>
  );
}

export default Basic;
import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  /*
   * All state property to store all waves
   */
  const [allMessages, setAllMessages] = useState([]);
  const contractAddress = "0xCA663eeE35D48B8de73958CEbdc54922C9f7d8BB";
  const contractABI = [
    {
      inputs: [],
      stateMutability: "payable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "fromTwitterUsername",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "message",
          type: "string",
        },
      ],
      name: "NewMessage",
      type: "event",
    },
    {
      inputs: [],
      name: "getAllMessages",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "fromTwitterUsername",
              type: "string",
            },
            {
              internalType: "address",
              name: "messenger",
              type: "address",
            },
            {
              internalType: "string",
              name: "message",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          internalType: "struct MessagePortal.Message[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalMessages",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_message",
          type: "string",
        },
        {
          internalType: "string",
          name: "_twitterUsername",
          type: "string",
        },
      ],
      name: "message",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const getAllMessages = async () => {
    console.log("getAllMessages");
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messagePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const messages = await messagePortalContract.getAllMessages();

        let messagesCleaned = [];

        messages.forEach((message) => {
          messagesCleaned.push({
            fromTwitterUsername: message.fromTwitterUsername,
            address: message.messenger,
            message: message.message,
            timestamp: message.timestamp,
          });
        });

        setAllMessages(messagesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      /*
       * First make sure we have access to window.ethereum
       */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllMessages();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addMessage = async () => {
    // check if we have username and message both if not show alert to enter both
    var userName = document.getElementById("username").value;
    var userMessage = document.getElementById("message").value;
    if (userName === "" || userMessage === "") {
      alert("Please enter a username and message");
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messagePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await messagePortalContract.getTotalMessages();
        console.log("Retrieved total message count...", count.toNumber());
        /*
         * Execute the actual message from your smart contract
         */
        const messageTxn = await messagePortalContract.message(
          userMessage,
          userName
        );
        console.log("Mining...", messageTxn.hash);

        await messageTxn.wait();
        console.log("Mined -- ", messageTxn.hash);

        count = await messagePortalContract.getTotalMessages();
        console.log("Retrieved total message count...", count.toNumber());

        // once message is added update ui and remove the message from the input
        document.getElementById("username").value = "";
        document.getElementById("message").value = "";
        getAllMessages();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className='App'
      style={{
        backgroundColor: "#fef6e4",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <header
        className='App-header'
        style={{ padding: "42px", maxWidth: "550px" }}
      >
        {/* <img
          alt='profile'
          style={{ height: "125px", width: "125px", margin: "4px 8px" }}
          src='https://user-images.githubusercontent.com/55942632/144991723-738656d6-2111-4714-8d3d-53da18ea7693.png'
        /> */}
        <a
          href='https://github.com/theindianappguy/ama-web3-portal'
          target='_blank'
          rel='noreferrer'
          style={{
            display: "flex",
            alignItems: "center",
            color: "#fff",
            backgroundColor: "#000",
            borderRadius: "24px",
            padding: "8px 16px",
            textDecoration: "none",
            fontSize: "16px",
            margin: "8px",
            fontWeight: "600",
          }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='icon icon-tabler icon-tabler-brand-github'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            stroke-width='2'
            stroke='currentColor'
            fill='none'
            stroke-linecap='round'
            stroke-linejoin='round'
            style={{ marginRight: "12px" }}
          >
            <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
            <path d='M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5'></path>
          </svg>
          Github
        </a>
        <h1 style={{ margin: "4px 8px", color: "#001858" }}>Send a message</h1>
        <p
          style={{
            margin: "4px 8px",
            color: "#172c66",
            fontSize: "18px",
          }}
        >
          Send <a href='https://twitter.com/indianappguy'>Sanskar</a>{" "}
          <span>👋</span> a public message on the blockchain and you will have a
          chance at winning some ETH!
        </p>

        <div style={{ display: "flex", alignItems: "center" }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='icon icon-tabler icon-tabler-brand-twitter'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            stroke-width='2'
            stroke='currentColor'
            fill='none'
            stroke-linecap='round'
            stroke-linejoin='round'
          >
            <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
            <path d='M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z'></path>
          </svg>
          <input
            style={{
              marginLeft: "24px",
              borderRadius: "8px",
              border: "1.5px solid #001858",
              padding: "8px 16px",
              margin: "14px",
            }}
            id='username'
            type='text'
            placeholder='twitter username'
          />
        </div>
        <textarea
          style={{
            width: "100%",
            minHeight: "100px",
            borderRadius: "8px",
            padding: "8px 16px",
            border: "1.5px solid #001858",
            margin: "14px",
          }}
          id='message'
          type='text'
          placeholder='Enter your message'
        />

        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "#f582ae",
            border: "1.5px solid #001858",
            borderRadius: "8px",
            color: "#001858",
            fontWeight: "500",
            margin: "14px",
            fontSize: "18px",
          }}
          onClick={addMessage}
        >
          Add Message
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className='waveButton' onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allMessages.map((message, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
                minWidth: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {/* <img
                  onError={(e) => (e.target.src = `"https://i.pravatar.cc/300"`)}
                  src={`https://github.com/${message.fromTwitterUsername}.png`}
                /> */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 0px",
                  }}
                >
                  <a
                    style={{ fontWeight: "500" }}
                    href={`https://twitter.com/${message.fromTwitterUsername}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    @{message.fromTwitterUsername}
                  </a>
                  <p style={{ margin: "0px 8px" }}>•</p>
                  <div>Time: {message.timestamp.toString()}</div>
                </div>
                <p>{message.address}</p>
              </div>

              <p
                style={{
                  minWidth: "100%",
                  backgroundColor: "#f3d2c1",
                  padding: "16px 24px",
                  margin: "16px 0px",
                  borderRadius: "0px 24px 24px",
                  textAlign: "left",
                  fontSize: "16px",
                }}
              >
                {message.message}
              </p>
            </div>
          );
        })}
      </header>
    </div>
  );
}

export default App;

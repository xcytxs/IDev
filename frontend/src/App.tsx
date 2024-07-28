import { useDisclosure } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CogTooth from "#/assets/cog-tooth";
import ChatInterface from "#/components/chat/ChatInterface";
import Errors from "#/components/Errors";
import { Container, Orientation } from "#/components/Resizable";
import Workspace from "#/components/Workspace";
import LoadPreviousSessionModal from "#/components/modals/load-previous-session/LoadPreviousSessionModal";
import SettingsModal from "#/components/modals/settings/SettingsModal";
import "./App.css";
import AgentControlBar from "./components/AgentControlBar";
import AgentStatusBar from "./components/AgentStatusBar";
import VolumeIcon from "./components/VolumeIcon";
import Terminal from "./components/terminal/Terminal";
import Session from "#/services/session";
import { getToken } from "#/services/auth";
import { settingsAreUpToDate } from "#/services/settings";
import * as Dialog from '@radix-ui/react-dialog';

interface ControlsProps {
  setSettingOpen: (isOpen: boolean) => void;
}

function Controls({ setSettingOpen }: ControlsProps): JSX.Element {
  return (
    <div className="flex w-full p-4 bg-neutral-900 items-center shrink-0 justify-between">
      <div className="flex items-center gap-4">
        <AgentControlBar />
      </div>
      <AgentStatusBar />
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginRight: "8px" }}>
          <VolumeIcon />
        </div>
        <div
          className="cursor-pointer hover:opacity-80 transition-all"
          onClick={() => setSettingOpen(true)}
        >
          <CogTooth />
        </div>
      </div>
    </div>
  );
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Implement login logic here
    console.log('Login attempted');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <button onClick={handleLogin} className="p-2 bg-blue-500 text-white rounded">Login</button>
    </div>
  );
};

const ModelConfig: React.FC = () => {
  const [modelType, setModelType] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [customModelPath, setCustomModelPath] = useState('');

  const handleSave = () => {
    // Implement save logic here
    console.log('Model configuration saved');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Model Configuration</h2>
      <select
        value={modelType}
        onChange={(e) => setModelType(e.target.value)}
        className="mb-2 p-2 border rounded"
      >
        <option value="openai">OpenAI</option>
        <option value="ollama">Ollama (Local)</option>
        <option value="custom">Custom</option>
      </select>
      {modelType === 'openai' && (
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
      )}
      {modelType === 'custom' && (
        <input
          type="text"
          placeholder="Custom Model Path"
          value={customModelPath}
          onChange={(e) => setCustomModelPath(e.target.value)}
          className="mb-2 p-2 border rounded"
        />
      )}
      <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded">Save Configuration</button>
    </div>
  );
};

// React.StrictMode will cause double rendering, use this to prevent it
let initOnce = false;

function App(): JSX.Element {
  const {
    isOpen: settingsModalIsOpen,
    onOpen: onSettingsModalOpen,
    onOpenChange: onSettingsModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: loadPreviousSessionModalIsOpen,
    onOpen: onLoadPreviousSessionModalOpen,
    onOpenChange: onLoadPreviousSessionModalOpenChange,
  } = useDisclosure();
  const [isModelConfigOpen, setIsModelConfigOpen] = useState(false);

  useEffect(() => {
    if (initOnce) return;
    initOnce = true;
    if (!settingsAreUpToDate()) {
      onSettingsModalOpen();
    } else if (getToken()) {
      onLoadPreviousSessionModalOpen();
    } else {
      Session.startNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col">
        <nav className="bg-neutral-800 p-4">
          <ul className="flex space-x-4">
            <li><Link to="/" className="text-white hover:text-blue-300">Home</Link></li>
            <li><Link to="/login" className="text-white hover:text-blue-300">Login</Link></li>
            <li><button onClick={() => setIsModelConfigOpen(true)} className="text-white hover:text-blue-300">Model Config</button></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <div className="flex grow bg-neutral-900 text-white min-h-0">
              <Container
                orientation={Orientation.HORIZONTAL}
                className="grow h-full min-h-0 min-w-0 px-3 pt-3"
                initialSize={500}
                firstChild={<ChatInterface />}
                firstClassName="min-w-[500px] rounded-xl overflow-hidden border border-neutral-600"
                secondChild={
                  <Container
                    orientation={Orientation.VERTICAL}
                    className="grow h-full min-h-0 min-w-0"
                    initialSize={window.innerHeight - 300}
                    firstChild={<Workspace />}
                    firstClassName="min-h-72 rounded-xl border border-neutral-600 bg-neutral-800 flex flex-col overflow-hidden"
                    secondChild={<Terminal />}
                    secondClassName="min-h-72 rounded-xl border border-neutral-600 bg-neutral-800"
                  />
                }
                secondClassName="flex flex-col overflow-hidden grow min-w-[500px]"
              />
            </div>
          } />
        </Routes>
        <Controls setSettingOpen={onSettingsModalOpen} />
        <SettingsModal
          isOpen={settingsModalIsOpen}
          onOpenChange={onSettingsModalOpenChange}
        />
        <LoadPreviousSessionModal
          isOpen={loadPreviousSessionModalIsOpen}
          onOpenChange={onLoadPreviousSessionModalOpenChange}
        />
        <Dialog.Root open={isModelConfigOpen} onOpenChange={setIsModelConfigOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-black/50 fixed inset-0" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
              <Dialog.Title className="text-2xl font-bold mb-4">Model Configuration</Dialog.Title>
              <ModelConfig />
              <Dialog.Close asChild>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                  ×
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Errors />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

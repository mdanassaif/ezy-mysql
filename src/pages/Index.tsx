// pages/MainPage.jsx
import { useState } from "react";
// import { Database, Terminal, Book } from "lucide-react";
// import CommandsSection from "../components/CommandsSection";
import SQLPlayground from "../components/SQLPlayground";

const MainPage = () => {
  const [activeTab, setActiveTab] = useState('playground');

  // const TabButton = ({ id, icon: Icon, label }) => (
  //   <button
  //     onClick={() => setActiveTab(id)}
  //     className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
  //       activeTab === id
  //         ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
  //         : 'bg-white/50 text-slate-600 hover:bg-white hover:shadow'
  //     }`}
  //   >
  //     <Icon className="w-4 h-4" />
  //     {label}
  //   </button>
  // );

  return (
    <div className="">
      <div >
        {/* Hero Section */}
        {/* <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-teal-500/10">
              <Database className="w-16 h-16 text-teal-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            MySQL Learning Hub
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn, practice, and master MySQL with ease
          </p>
        </div> */}

        {/* Navigation Tabs */}
        {/* <div className="flex flex-wrap justify-center gap-4">
          <TabButton id="commands" icon={Database} label="Commands" />
          <TabButton id="playground" icon={Terminal} label="Playground" />
        </div> */}

        {/* Content Sections */}
        <div className="animate-fadeIn">
          {/* {activeTab === 'commands' && <CommandsSection />} */}
          {activeTab === 'playground' && <SQLPlayground />}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
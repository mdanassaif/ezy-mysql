import { useState } from "react";
import { Database, Terminal, Book, Search, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SQLPlayground } from "@/components/SQLPlayground";
import { Tutorial } from "@/components/Tutorial";

const COMMON_COMMANDS = [
  {
    title: "SELECT",
    syntax: "SELECT column1, column2 FROM table_name;",
    description: "Retrieve data from one or more tables",
    example: "SELECT username, email FROM users;",
    category: "Query"
  },
  {
    title: "INSERT",
    syntax: "INSERT INTO table_name (column1, column2) VALUES (value1, value2);",
    description: "Add new records to a table",
    example: "INSERT INTO users (username, email) VALUES ('john_doe', 'john@example.com');",
    category: "Modification"
  },
  {
    title: "UPDATE",
    syntax: "UPDATE table_name SET column1 = value1 WHERE condition;",
    description: "Modify existing records in a table",
    example: "UPDATE users SET email = 'new@example.com' WHERE username = 'john_doe';",
    category: "Modification"
  },
  {
    title: "DELETE",
    syntax: "DELETE FROM table_name WHERE condition;",
    description: "Remove records from a table",
    example: "DELETE FROM users WHERE username = 'john_doe';",
    category: "Modification"
  },
  {
    title: "CREATE TABLE",
    syntax: "CREATE TABLE table_name (column1 datatype, column2 datatype);",
    description: "Create a new table in the database",
    example: "CREATE TABLE users (id INT PRIMARY KEY, username VARCHAR(50));",
    category: "Definition"
  },
  {
    title: "JOIN",
    syntax: "SELECT * FROM table1 JOIN table2 ON table1.id = table2.id;",
    description: "Combine rows from multiple tables",
    example: "SELECT users.username, orders.order_date FROM users JOIN orders ON users.id = orders.user_id;",
    category: "Query"
  }
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-slate-500" />
      )}
    </button>
  );
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('commands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(COMMON_COMMANDS.map(cmd => cmd.category))];

  const filteredCommands = COMMON_COMMANDS.filter(command => {
    const matchesSearch = command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-primary text-white shadow-lg shadow-primary/25'
          : 'bg-white/50 text-slate-600 hover:bg-white hover:shadow'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="m14 19l3 3l5-5M4 6v6s0 3 7 3s7-3 7-3V6"/><path d="M11 3c7 0 7 3 7 3s0 3-7 3s-7-3-7-3s0-3 7-3Zm0 18c-7 0-7-3-7-3v-6"/></g></svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            Make MySQL Ezy
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn, practice and Boom!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4">
          <TabButton id="commands" icon={Database} label="Commands" />
          <TabButton id="playground" icon={Terminal} label="Playground" />
          <TabButton id="tutorial" icon={Book} label="Tutorial" />
        </div>

        {/* Content Sections */}
        <div className="animate-fadeIn">
          {activeTab === 'commands' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search commands..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommands.map((command, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-slate-800">{command.title}</h3>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {command.category}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{command.description}</p>
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Syntax</span>
                            <CopyButton text={command.syntax} />
                          </div>
                          <code className="text-sm text-slate-800">{command.syntax}</code>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Example</span>
                            <CopyButton text={command.example} />
                          </div>
                          <code className="text-sm text-slate-800">{command.example}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'playground' && <SQLPlayground />}
          
          {activeTab === 'tutorial' && <Tutorial />}
        </div>
      </div>
    </div>
  );
};

export default Index;
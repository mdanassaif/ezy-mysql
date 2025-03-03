// components/SQLPlayground.jsx
import { useState, useEffect } from "react";
import { Play, Database, Table, Eye, Plus, CircleDot, Info, Twitter, Linkedin, Globe, Github, User } from "lucide-react";
import toast from "react-hot-toast";

const SQLPlayground = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState("");
  const [tableData, setTableData] = useState(null);
  const [tableColumns, setTableColumns] = useState([]);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedDatabases = localStorage.getItem('mysql_databases');
    const savedSelectedDb = localStorage.getItem('mysql_selected_db');
    if (savedDatabases) {
      setDatabases(JSON.parse(savedDatabases));
    }
    if (savedSelectedDb) {
      setSelectedDb(savedSelectedDb);
    }
  }, []);

  // Save databases to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mysql_databases', JSON.stringify(databases));
  }, [databases]);

  // Save selected database to localStorage whenever it changes
  useEffect(() => {
    if (selectedDb) {
      localStorage.setItem('mysql_selected_db', selectedDb);
    }
  }, [selectedDb]);

  // Add supported commands info
  const supportedCommandsInfo = [
    {
      command: "CREATE DATABASE",
      example: "CREATE DATABASE my_db;",
      description: "Creates a new database"
    },
    {
      command: "USE",
      example: "USE my_db;",
      description: "Switches to specified database"
    },
    {
      command: "CREATE TABLE",
      example: "CREATE TABLE users (name, email, age);",
      description: "Creates a new table with specified columns"
    },
    {
      command: "INSERT INTO",
      example: "INSERT INTO users (name, email) VALUES ('John', 'john@example.com');",
      description: "Inserts new records into a table"
    },
    {
      command: "SELECT",
      example: "SELECT * FROM users;",
      description: "Retrieves data from a table"
    },
    {
      command: "UPDATE",
      example: "UPDATE users SET name = 'Jane' WHERE email = 'john@example.com';",
      description: "Modifies existing records"
    },
    {
      command: "DELETE FROM",
      example: "DELETE FROM users WHERE name = 'John';",
      description: "Removes records from a table"
    },
    {
      command: "SHOW DATABASES",
      example: "SHOW DATABASES;",
      description: "Lists all databases"
    },
    {
      command: "SHOW TABLES",
      example: "SHOW TABLES;",
      description: "Lists all tables in current database"
    },
    {
      command: "DROP DATABASE",
      example: "DROP DATABASE my_db;",
      description: "Deletes a database"
    },
    {
      command: "DROP TABLE",
      example: "DROP TABLE users;",
      description: "Deletes a table"
    }
  ];

  const handleExecute = () => {
    const queryLower = query.toLowerCase().trim();
    let resultMessage = '';

    try {
      // Validate if the query is a supported SQL command
      const supportedCommands = [
        "select", "insert into", "update", "delete from", "create database", 
        "use", "create table", "show databases", "show tables", "drop database", "drop table"
      ];
      const isSupported = supportedCommands.some(cmd => queryLower.startsWith(cmd));
      if (!isSupported) {
        throw new Error(`Unsupported SQL command: ${query.split(" ")[0]}`);
      }

      // Handle SELECT queries
      if (queryLower.startsWith("select")) {
        if (!selectedDb) throw new Error("No database selected. Use 'USE database_name;' first.");

        // Parse the table name from the query
        const tableMatch = queryLower.match(/from\s+(\w+)/i);
        if (!tableMatch) throw new Error("Invalid SELECT query. Please specify a table name.");
        const tableName = tableMatch[1];

        // Find the table in the current database
        const currentDb = databases.find(db => db.name === selectedDb);
        const table = currentDb?.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());

        if (!table) throw new Error(`Table '${tableName}' not found in database '${selectedDb}'`);

        // Handle SELECT * (all columns)
        const isSelectAll = queryLower.includes("*");
        const columnsToShow = isSelectAll ? table.columns : queryLower
          .split("select")[1]
          .split("from")[0]
          .split(",")
          .map(col => col.trim());

        // Validate columns
        const invalidColumns = columnsToShow.filter(col => !table.columns.includes(col));
        if (invalidColumns.length > 0 && !isSelectAll) {
          throw new Error(`Invalid columns: ${invalidColumns.join(", ")}`);
        }

        // Set the table data and columns for display
        setTableColumns(isSelectAll ? table.columns : columnsToShow);
        setTableData(table.data || []);
        resultMessage = `Retrieved ${table.data?.length || 0} rows from ${tableName}`;
      }
      // Handle INSERT queries
      else if (queryLower.startsWith("insert into")) {
        if (!selectedDb) throw new Error("No database selected");

        // Parse the table name, columns, and values
        const insertRegex = /insert into\s+(\w+)\s*\(([^)]+)\)\s*values\s*(.+);/i;
        const match = query.match(insertRegex);
        if (!match) throw new Error("Invalid INSERT syntax");

        const [, tableName, columns, values] = match;
        const columnList = columns.split(',').map(c => c.trim());

        // Normalize the values by removing line breaks and extra spaces
        const normalizedValues = values
          .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
          .replace(/\s*,\s*/g, ',') // Remove spaces around commas
          .trim();

        // Split multiple rows
        const rows = normalizedValues
          .split(/\),\s*\(/) // Split rows by "), (" or "),("
          .map(row => row.replace(/[()]/g, '').trim());

        // Validate columns and rows
        const currentDb = databases.find(db => db.name === selectedDb);
        const table = currentDb?.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) throw new Error(`Table '${tableName}' not found in database '${selectedDb}'`);

        const invalidColumns = columnList.filter(col => !table.columns.includes(col));
        if (invalidColumns.length > 0) {
          throw new Error(`Invalid columns: ${invalidColumns.join(", ")}`);
        }

        // Insert rows
        const newRows = rows.map(row => {
          const valueList = row.split(',').map(v => v.trim().replace(/^'(.*)'$/, '$1'));
          if (valueList.length !== columnList.length) {
            throw new Error("Column count doesn't match value count");
          }

          const newRow = {};
          columnList.forEach((col, index) => {
            newRow[col] = valueList[index];
          });
          return newRow;
        });

        // Update table data
        const updatedTables = currentDb.tables.map(t => {
          if (t.name.toLowerCase() === tableName.toLowerCase()) {
            return { ...t, data: [...t.data, ...newRows] };
          }
          return t;
        });

        // Update databases state
        setDatabases(prev => prev.map(db => {
          if (db.name === selectedDb) {
            return { ...db, tables: updatedTables };
          }
          return db;
        }));

        resultMessage = `${newRows.length} rows inserted into ${tableName}`;
        setTableData(null);
      }
      // Handle UPDATE queries
      else if (queryLower.startsWith("update")) {
        if (!selectedDb) throw new Error("No database selected");

        // Parse the table name, SET clause, and WHERE clause
        const updateRegex = /update\s+(\w+)\s+set\s+([^;]+)\s+where\s+([^;]+);/i;
        const match = query.match(updateRegex);
        if (!match) throw new Error("Invalid UPDATE syntax");

        const [, tableName, setClause, whereClause] = match;

        // Find the table in the current database
        const currentDb = databases.find(db => db.name === selectedDb);
        const table = currentDb?.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) throw new Error(`Table '${tableName}' not found in database '${selectedDb}'`);

        // Parse the SET clause
        const setPairs = setClause.split(',').map(pair => pair.trim().split('=').map(p => p.trim()));
        const invalidColumns = setPairs.map(pair => pair[0]).filter(col => !table.columns.includes(col));
        if (invalidColumns.length > 0) {
          throw new Error(`Invalid columns: ${invalidColumns.join(", ")}`);
        }

        // Parse the WHERE clause
        const [whereColumn, whereValue] = whereClause.split('=').map(p => p.trim());

        // Update rows
        const updatedData = table.data.map(row => {
          if (row[whereColumn] === whereValue.replace(/^'(.*)'$/, '$1')) {
            setPairs.forEach(([col, val]) => {
              row[col] = val.replace(/^'(.*)'$/, '$1');
            });
          }
          return row;
        });

        // Update table data
        const updatedTables = currentDb.tables.map(t => {
          if (t.name.toLowerCase() === tableName.toLowerCase()) {
            return { ...t, data: updatedData };
          }
          return t;
        });

        // Update databases state
        setDatabases(prev => prev.map(db => {
          if (db.name === selectedDb) {
            return { ...db, tables: updatedTables };
          }
          return db;
        }));

        resultMessage = `Updated rows in ${tableName}`;
        setTableData(null);
      }
      // Handle DELETE queries
      else if (queryLower.startsWith("delete from")) {
        if (!selectedDb) throw new Error("No database selected");
      
        // Parse the table name and WHERE clause
        const deleteRegex = /delete from\s+(\w+)\s+where\s+([^;]+);/i;
        const match = query.match(deleteRegex);
        if (!match) throw new Error("Invalid DELETE syntax");
      
        const [, tableName, whereClause] = match;
      
        // Find the table in the current database
        const currentDb = databases.find(db => db.name === selectedDb);
        const table = currentDb?.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) throw new Error(`Table '${tableName}' not found in database '${selectedDb}'`);
      
        // Parse the WHERE clause
        const whereParts = whereClause.split(/([=<>!]+)/); // Split by operators (=, >, <, >=, <=, !=)
        const whereColumn = whereParts[0].trim();
        const operator = whereParts[1].trim();
        const whereValue = whereParts[2].trim().replace(/^'(.*)'$/, '$1'); // Remove quotes if present
      
        // Validate the column
        if (!table.columns.includes(whereColumn)) {
          throw new Error(`Column '${whereColumn}' does not exist in table '${tableName}'`);
        }
      
        // Delete rows based on the condition
        const updatedData = table.data.filter(row => {
          const rowValue = row[whereColumn];
          switch (operator) {
            case "=":
              return rowValue != whereValue; // Keep rows that don't match
            case "!=":
              return rowValue == whereValue; // Keep rows that match
            case ">":
              return !(parseInt(rowValue) > parseInt(whereValue)); // Keep rows that don't satisfy the condition
            case "<":
              return !(parseInt(rowValue) < parseInt(whereValue)); // Keep rows that don't satisfy the condition
            case ">=":
              return !(parseInt(rowValue) >= parseInt(whereValue)); // Keep rows that don't satisfy the condition
            case "<=":
              return !(parseInt(rowValue) <= parseInt(whereValue)); // Keep rows that don't satisfy the condition
            default:
              throw new Error(`Unsupported operator: ${operator}`);
          }
        });
      
        // Update table data
        const updatedTables = currentDb.tables.map(t => {
          if (t.name.toLowerCase() === tableName.toLowerCase()) {
            return { ...t, data: updatedData };
          }
          return t;
        });
      
        // Update databases state
        setDatabases(prev => prev.map(db => {
          if (db.name === selectedDb) {
            return { ...db, tables: updatedTables };
          }
          return db;
        }));
      
        resultMessage = `Deleted rows from ${tableName}`;
        setTableData(null);
      }
      // CREATE DATABASE
      else if (queryLower.startsWith("create database")) {
        const dbName = query.split(" ")[2]?.replace(";", "");
        if (!dbName) throw new Error("Invalid database name");

        if (databases.some(db => db.name.toLowerCase() === dbName.toLowerCase())) {
          throw new Error(`Database '${dbName}' already exists`);
        }

        setDatabases(prev => [...prev, { name: dbName, tables: [] }]);
        resultMessage = `Database '${dbName}' created successfully`;
        setTableData(null);
      }
      // USE DATABASE
      else if (queryLower.startsWith("use")) {
        const dbName = query.split(" ")[1]?.replace(";", "").trim();
        if (!dbName) throw new Error("Please specify a database name");

        const database = databases.find(db => db.name.toLowerCase() === dbName.toLowerCase());
        if (!database) throw new Error(`Database '${dbName}' not found`);

        setSelectedDb(database.name);
        resultMessage = `Using database '${database.name}'`;
        setTableData(null);
      }
      // CREATE TABLE
      else if (queryLower.startsWith("create table")) {
        if (!selectedDb) throw new Error("No database selected");

        const tableName = query.split(" ")[2]?.split("(")[0];
        if (!tableName) throw new Error("Invalid table name");

        const columnsMatch = query.match(/\((.*)\)/);
        if (!columnsMatch) throw new Error("Invalid table definition");

        const columns = columnsMatch[1].split(",").map(col => col.trim().split(" ")[0]);

        setDatabases(prev => prev.map(db => {
          if (db.name === selectedDb) {
            return {
              ...db,
              tables: [...db.tables, { name: tableName, columns, data: [] }]
            };
          }
          return db;
        }));

        resultMessage = `Table '${tableName}' created in database '${selectedDb}'`;
        setTableData(null);
      }
      // SHOW DATABASES
      else if (queryLower === "show databases;") {
        resultMessage = `Databases:\n${databases.map(db => db.name).join('\n')}`;
        setTableData(null);
      }
      // SHOW TABLES
      else if (queryLower === "show tables;") {
        if (!selectedDb) throw new Error("No database selected");

        const db = databases.find(db => db.name === selectedDb);
        if (!db?.tables.length) {
          resultMessage = `No tables in database '${selectedDb}'`;
        } else {
          resultMessage = `Tables in '${selectedDb}':\n${db.tables.map(t => t.name).join('\n')}`;
        }
        setTableData(null);
      }
      // DROP DATABASE
      else if (queryLower.startsWith("drop database")) {
        const dbName = query.split(" ")[2]?.replace(";", "").trim();
        if (!dbName) throw new Error("Please specify a database name");

        const dbExists = databases.some(db => db.name.toLowerCase() === dbName.toLowerCase());
        if (!dbExists) throw new Error(`Database '${dbName}' does not exist`);

        setDatabases(prev => prev.filter(db => db.name.toLowerCase() !== dbName.toLowerCase()));
        if (selectedDb.toLowerCase() === dbName.toLowerCase()) {
          setSelectedDb("");
        }

        resultMessage = `Database '${dbName}' dropped successfully`;
        setTableData(null);
      }
      // DROP TABLE
      else if (queryLower.startsWith("drop table")) {
        if (!selectedDb) throw new Error("No database selected");

        const tableName = query.split(" ")[2]?.replace(";", "").trim();
        if (!tableName) throw new Error("Please specify a table name");

        setDatabases(prev => prev.map(db => {
          if (db.name === selectedDb) {
            const tableExists = db.tables.some(t => t.name.toLowerCase() === tableName.toLowerCase());
            if (!tableExists) throw new Error(`Table '${tableName}' does not exist in '${selectedDb}'`);

            return {
              ...db,
              tables: db.tables.filter(t => t.name.toLowerCase() !== tableName.toLowerCase())
            };
          }
          return db;
        }));

        resultMessage = `Table '${tableName}' dropped from '${selectedDb}'`;
        setTableData(null);
      }

      toast.success(resultMessage);
      setResults(prev => [...prev, `Success: ${query}\n${resultMessage}`]);
    } catch (error) {
      toast.error(error.message);
      setResults(prev => [...prev, `Error: ${query}\n${error.message}`]);
      setTableData(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Database Explorer */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                Databases
              </h3>
              <button
                onClick={() => setIsAboutOpen(true)}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                title="About SQL Playground"
              >
                <Info className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {databases.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium">No databases yet</p>
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg inline-block">
                  Try: CREATE DATABASE my_db;
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {databases.map((db) => (
                  <div 
                    key={db.name} 
                    className={`rounded-xl p-4 transition-all duration-300 ${
                      selectedDb === db.name 
                        ? 'bg-teal-50 ring-1 ring-teal-200 ' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                      <Database className={`w-4 h-4 ${selectedDb === db.name ? 'text-teal-600' : ''}`} />
                      <span className={`${selectedDb === db.name ? 'text-teal-600 font-medium' : ''}`}>
                        {db.name}
                      </span>
                    </div>
                    {db.tables.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {db.tables.map((table) => (
                          <div
                            key={table.name}
                            className="flex items-center gap-2 p-2 text-sm text-slate-600 group hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Table className="w-3 h-3" />
                            <span className="font-medium">{table.name}</span>
                            <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">
                              {table.columns.length} cols
                            </span>
                            <button
                              onClick={() => {
                                setTableColumns(table.columns);
                                setTableData(table.data);
                              }}
                              className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Eye className="w-3 h-3 text-teal-500 hover:text-teal-700" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="fixed bottom-0 left-0 w-full border-t border-slate-200 bg-white/80 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="w-full h-full rounded-full bg-teal-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-teal-500 text-white p-1 rounded-full">
                  <Database className="w-3 h-3" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-slate-800 text-sm">mdanassaif</h3>
                <p className="text-xs text-slate-500">
                  Simplifying the internet 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/mdanassaif"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/mdanassaif"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/mdanassaif"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <a
                href="https://mdanassaif.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs text-slate-600 transition-colors"
              >
                <Globe className="w-3 h-3" />
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>

        </div>

        {/* Query Editor and Results */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-xl p-6  border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">MySQL EZyyy</h3>
              {selectedDb && (
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full">
                  <CircleDot className="w-3 h-3 text-teal-500 animate-pulse" />
                  <span className="text-sm text-teal-600 font-medium">{selectedDb}</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SQL command here..."
                  className="w-full h-40 p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/50 focus:outline-none border border-slate-200 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleExecute();
                    }
                  }}
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                  Press Ctrl + Enter to execute
                </div>
              </div>
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors "
              >
                <Play size={16} />
                Run Query
              </button>
            </div>
          </div>

          {/* Table Results */}
          {tableData && (
            <div className="bg-white rounded-xl p-6  border border-slate-100 overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Query Results ({tableData.length} row{tableData.length !== 1 ? 's' : ''})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      {tableColumns.map((column, index) => (
                        <th 
                          key={index} 
                          className="p-3 text-left border-b border-slate-200 text-slate-600 font-medium"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                        {tableColumns.map((column, colIndex) => (
                          <td 
                            key={colIndex} 
                            className="p-3 border-b border-slate-100 text-slate-700"
                          >
                            {row[column] || <span className="text-slate-400">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Query History */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl p-6  border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Query History
              </h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border text-sm font-mono whitespace-pre-wrap ${
                      result.startsWith("Error")
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-green-50 border-green-200 text-green-600'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">About SQL Playground</h2>
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-6">
                This SQL Playground allows you to practice and learn SQL commands in a safe environment.
                All data is stored locally in your browser and will persist between sessions.
              </p>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Supported Commands</h3>
              <div className="space-y-4">
                {supportedCommandsInfo.map((info, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-mono text-teal-600 font-medium mb-2">{info.command}</h4>
                    <p className="text-slate-600 text-sm mb-2">{info.description}</p>
                    <pre className="bg-white p-3 rounded-lg text-sm font-mono text-slate-700 border border-slate-200">
                      {info.example}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SQLPlayground;
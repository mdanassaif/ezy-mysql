import { useState, useEffect } from "react";
import { Play, Database, Table, Eye, Plus, CircleDot, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface DatabaseTable {
  name: string;
  columns: string[];
  data: Record<string, string | number | boolean | null>[];
}

interface DatabaseStructure {
  name: string;
  tables: DatabaseTable[];
}

export const SQLPlayground = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [databases, setDatabases] = useState<DatabaseStructure[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 10;
  

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

  useEffect(() => {
    localStorage.setItem('mysql_databases', JSON.stringify(databases));
  }, [databases]);

  useEffect(() => {
    if (selectedDb) {
      localStorage.setItem('mysql_selected_db', selectedDb);
    }
  }, [selectedDb]);

  const handleExecute = () => {
    const queryLower = query.toLowerCase().trim();
    let resultMessage = '';
    
    try {
      // Handle SELECT queries
      if (queryLower.startsWith("select")) {
        if (!selectedDb) throw new Error("No database selected. Use 'USE database_name' first.");
        
        // Parse the table name from the query
        const tableMatch = queryLower.match(/from\s+(\w+)/i);
        if (!tableMatch) throw new Error("Invalid SELECT query. Please specify a table name.");
        const tableName = tableMatch[1];
        
        // Find the table in the current database
        const currentDb = databases.find(db => db.name === selectedDb);
        const table = currentDb?.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        
        if (!table) throw new Error(`Table '${tableName}' not found in database '${selectedDb}'`);
        
        // Set the table data and columns for display
        setTableColumns(table.columns);
        setTableData(table.data || []);
        resultMessage = `Retrieved ${table.data?.length || 0} rows from ${tableName}`;
      }
      // Handle multiple row INSERT queries
     // Replace the INSERT block in handleExecute() with:
else if (queryLower.startsWith("insert into")) {
  if (!selectedDb) throw new Error("No database selected");

  // Improved regex to capture all rows
  const insertRegex = /insert into\s+(\w+)\s*\(([^)]+)\)\s*values\s*((\s*\(.*?\)\s*,?)+)/i;
  const match = query.match(insertRegex);
  if (!match) throw new Error("Invalid INSERT syntax");

  const [, tableName, columns, allValues] = match;
  const columnList = columns.split(',').map(c => c.trim());

  // Split rows and clean parentheses/quotes
  const rows = allValues.split(/\)\s*,\s*\(/).map(row => 
    row.replace(/^\(|\)$/g, '') // Remove any remaining ( or )
  );

  const newRows = rows.map(row => {
    return row
      .split(',')
      .map(v => {
        const val = v.trim();
        // Remove quotes only if they wrap the value
        return val.startsWith("'") && val.endsWith("'") 
          ? val.slice(1, -1) 
          : val;
      });
  });

  setDatabases(prev => prev.map(db => {
    if (db.name === selectedDb) {
      const tableIndex = db.tables.findIndex(t => t.name === tableName);
      if (tableIndex === -1) throw new Error(`Table ${tableName} not found`);

      const updatedData = [
        ...db.tables[tableIndex].data,
        ...newRows.map(values => 
          Object.fromEntries(columnList.map((col, i) => [col, values[i]]))
        )
      ];

      const updatedTables = [...db.tables];
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        data: updatedData
      };

      return { ...db, tables: updatedTables };
    }
    return db;
  }));

  resultMessage = `${newRows.length} row(s) inserted into ${tableName}`;
  setTableData(null);
}
      // CREATE DATABASE
      else if (queryLower.startsWith("create database")) {
        const dbName = query.split(" ")[2]?.replace(";", "");
        if (!dbName) throw new Error("Invalid database name");
        
        if (databases.some(db => db.name === dbName)) {
          throw new Error(`Database ${dbName} already exists`);
        }
        
        setDatabases(prev => [...prev, { name: dbName, tables: [] }]);
        resultMessage = `Database ${dbName} created successfully`;
        setTableData(null);
      }
      // USE DATABASE
      else if (queryLower.startsWith("use")) {
        const dbName = query.split(" ")[1]?.replace(";", "").trim();
        if (!dbName) throw new Error("Please specify a database name");
        
        const database = databases.find(db => db.name.toLowerCase() === dbName.toLowerCase());
        if (!database) throw new Error(`Database '${dbName}' not found`);
        
        setSelectedDb(database.name);
        resultMessage = `Using database ${database.name}`;
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
        
        resultMessage = `Table ${tableName} created in ${selectedDb}`;
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
          resultMessage = `No tables in database ${selectedDb}`;
        } else {
          resultMessage = `Tables in ${selectedDb}:\n${db.tables.map(t => t.name).join('\n')}`;
        }
        setTableData(null);
      }

      toast.success(resultMessage);
      setResults(prev => [...prev, `Success: ${query}\n${resultMessage}`]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        setResults(prev => [...prev, `Error: ${query}\n${error.message}`]);
      } else {
        toast.error("An unknown error occurred");
        setResults(prev => [...prev, `Error: ${query}\nAn unknown error occurred`]);
      }
      setTableData(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Database Explorer */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Database Explorer
          </h3>
          
          {databases.length === 0 ? (
            <div className="text-center py-12 space-y-4">
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
                      ? 'bg-primary/5 ring-1 ring-primary/20 shadow-sm' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-slate-700 mb-3">
                    <Database className={`w-4 h-4 ${selectedDb === db.name ? 'text-primary' : ''}`} />
                    <span className={`${selectedDb === db.name ? 'text-primary font-medium' : ''}`}>
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
                            <Eye className="w-3 h-3 text-primary hover:text-primary/80" />
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
      </div>

      {/* Query Editor and Results */}
      <div className="md:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">SQL Command Playground</h3>
            {selectedDb && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <CircleDot className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">{selectedDb}</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL command here..."
                className="w-full h-40 p-4 bg-slate-50 rounded-xl font-mono text-sm text-slate-800 focus:ring-2 focus:ring-primary/50 focus:outline-none border border-slate-200 transition-all duration-200"
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
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30"
            >
              <Play size={16} />
              Execute Query
            </button>
          </div>
        </div>

        {/* Table Results */}
        {tableData && (
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-600">
                Query Results ({tableData.length} row{tableData.length !== 1 ? 's' : ''})
              </h4>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-sm bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-slate-600 px-3 py-1 bg-slate-50 rounded-lg">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(tableData.length / rowsPerPage)))}
                  disabled={currentPage * rowsPerPage >= tableData.length}
                  className="p-2 text-sm bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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
                  {tableData
                    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                    .map((row, rowIndex) => (
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
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Query History
            </h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border text-sm font-mono whitespace-pre-wrap transition-all duration-200 ${
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
  );
};

 
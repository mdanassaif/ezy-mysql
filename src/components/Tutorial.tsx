import React from 'react';
import { Book, Database, Terminal, Table, Key, Search, Plus, Edit } from 'lucide-react';

const TutorialSection = ({ icon: Icon, title, content }) => (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
    <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
      <div className="p-2 md:p-3 rounded-full bg-primary/10">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
      </div>
      <div className="space-y-2 w-full">
        <h3 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h3>
        <div className="text-sm md:text-base text-slate-600 space-y-2">
          {content}
        </div>
      </div>
    </div>
  </div>
);

const CodeBlock = ({ children }) => (
  <pre className="bg-slate-800 text-slate-100 p-3 md:p-4 rounded-lg mt-2 overflow-x-auto text-xs md:text-sm">
    <code>{children}</code>
  </pre>
);

export const Tutorial = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 p-3 md:p-6 animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 md:mb-6">Complete MySQL Guide</h1>

      <TutorialSection
        icon={Database}
        title="What is MySQL?"
        content={
          <div>
            <p>MySQL is an open-source relational database management system (RDBMS) that uses SQL (Structured Query Language). It's one of the most popular databases worldwide, known for its:</p>
            <ul className="list-disc ml-4 md:ml-6 mt-2 space-y-1 md:space-y-2">
              <li>Reliability and proven performance</li>
              <li>Ease of use and robust feature set</li>
              <li>Cross-platform compatibility</li>
              <li>Free availability and open-source nature</li>
            </ul>
          </div>
        }
      />

      <TutorialSection
        icon={Terminal}
        title="Basic Database Operations"
        content={
          <div>
            <p>Here are the fundamental database operations:</p>
            <CodeBlock>
{`-- Create a new database
CREATE DATABASE mydatabase;

-- Select a database to use
USE mydatabase;

-- Show all databases
SHOW DATABASES;

-- Delete a database
DROP DATABASE mydatabase;`}
            </CodeBlock>
          </div>
        }
      />

      <TutorialSection
        icon={Table}
        title="Working with Tables"
        content={
          <div>
            <p>Tables are where you store your data. Here's how to work with them:</p>
            <CodeBlock>
{`-- Create a new table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Show all tables
SHOW TABLES;

-- View table structure
DESCRIBE users;

-- Delete a table
DROP TABLE users;`}
            </CodeBlock>
          </div>
        }
      />

      <TutorialSection
        icon={Plus}
        title="Adding and Modifying Data"
        content={
          <div>
            <p>Common commands for managing data:</p>
            <CodeBlock>
{`-- Insert data
INSERT INTO users (username, email) 
VALUES ('mdanassaif', 'mdanassaif@example.com');

-- Update data
UPDATE users 
SET email = 'newemail@example.com' 
WHERE username = 'mdanassaif';

-- Delete data
DELETE FROM users 
WHERE username = 'mdanassaif';`}
            </CodeBlock>
          </div>
        }
      />

      <TutorialSection
        icon={Search}
        title="Querying Data"
        content={
          <div>
            <p>Essential SELECT commands for retrieving data:</p>
            <CodeBlock>
{`-- Basic select
SELECT * FROM users;

-- Select specific columns
SELECT username, email FROM users;

-- Select with conditions
SELECT * FROM users 
WHERE created_at >= '2024-01-01';

-- Select with sorting
SELECT * FROM users 
ORDER BY username ASC;

-- Select with limit
SELECT * FROM users 
LIMIT 10;`}
            </CodeBlock>
          </div>
        }
      />

      <TutorialSection
        icon={Key}
        title="Advanced Concepts"
        content={
          <div>
            <p>Important advanced MySQL features:</p>
            <ul className="list-disc ml-4 md:ml-6 mt-2 space-y-1 md:space-y-2">
              <li>
                <strong>Joins:</strong>
                <CodeBlock>
{`SELECT users.username, orders.order_date 
FROM users 
JOIN orders ON users.id = orders.user_id;`}
                </CodeBlock>
              </li>
              <li>
                <strong>Indexes:</strong>
                <CodeBlock>
{`-- Create an index
CREATE INDEX idx_username 
ON users(username);`}
                </CodeBlock>
              </li>
              <li>
                <strong>Views:</strong>
                <CodeBlock>
{`-- Create a view
CREATE VIEW active_users AS 
SELECT * FROM users 
WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY);`}
                </CodeBlock>
              </li>
            </ul>
          </div>
        }
      />
    </div>
  );
};

 
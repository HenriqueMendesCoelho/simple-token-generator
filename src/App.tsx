import './App.css';
import FormGenerateToken from '@/components/FormGenerateToken';

function App() {
  return (
    <main className="flex-col p-3 select-none">
      <div className="border-b">
        <p className="dark:text-gray-300 text-gray-800 text-md">
          Create JWT tokens for testing or development.
        </p>
      </div>
      <FormGenerateToken />
    </main>
  );
}

export default App;

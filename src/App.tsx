import FormGenerateToken from '@/components/FormGenerateToken';
import SettingsDialog from '@/components/SettingsDialog';

function App() {
  return (
    <main className="flex-col p-3 select-none">
      <div className="border-b flex justify-between items-center">
        <p className="dark:text-gray-300 text-gray-800 text-md">
          Create JWT tokens for testing or development.
        </p>
        <SettingsDialog />
      </div>
      <FormGenerateToken />
    </main>
  );
}

export default App;

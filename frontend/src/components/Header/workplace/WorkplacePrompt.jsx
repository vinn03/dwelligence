import { useAppContext } from "../../../context/AppContext";

const WorkplacePrompt = () => {
  const { workplace } = useAppContext();

  if (workplace) return null;

  return (
    <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
      <p className="text-sm text-yellow-800">
        Set your workplace to see commute times and better ranked results
      </p>
    </div>
  );
};

export default WorkplacePrompt;

const EmptyState = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
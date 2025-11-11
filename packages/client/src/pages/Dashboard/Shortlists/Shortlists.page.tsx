import { CompaniesPane } from "./components/CompaniesPane/CompaniesPane";
import { ShortlistsPane } from "./components/ShortlistsPane";

export const ShortlistsPage = () => {
  // DRAW
  return (
    <div className="w-full h-full overflow-hidden grid grid-cols-[350px_400px_1fr] gap-2">
      <CompaniesPane />
      <ShortlistsPane />
    </div>
  );
};

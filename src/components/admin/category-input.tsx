import { CATEGORY_SUGGESTIONS } from "@/lib/categories";
import { Input } from "@/components/ui/input";

/** Free-text category field with the launch topics offered as autocomplete suggestions. */
export function CategoryInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <Input
        id={id}
        list={`${id}-suggestions`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Autism"
        required
      />
      <datalist id={`${id}-suggestions`}>
        {CATEGORY_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </>
  );
}

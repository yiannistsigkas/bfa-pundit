import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface CompanySelectorProps {
  companies: string[];
  selectedCompanies: string[];
  onSelect: (companies: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

export function CompanySelector({
  companies,
  selectedCompanies,
  onSelect,
  multiple = false,
  placeholder = "Select a company"
}: CompanySelectorProps) {
  if (multiple) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {selectedCompanies.map(company => (
            <Badge
              key={company}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => onSelect(selectedCompanies.filter(c => c !== company))}
            >
              {company} ×
            </Badge>
          ))}
        </div>
        <Select
          value=""
          onValueChange={(value) => {
            if (!selectedCompanies.includes(value)) {
              onSelect([...selectedCompanies, value]);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Add company...</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {companies
              .filter(c => !selectedCompanies.includes(c))
              .map(company => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Select
      value={selectedCompanies[0] || ''}
      onValueChange={(value) => onSelect([value])}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {companies.map(company => (
          <SelectItem key={company} value={company}>
            {company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


export function downloadCSV(data: any[], filename: string) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function convertToCSV(objArray: any[]): string {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  if (array.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(array[0]);
  
  // Create CSV header row
  let str = headers.join(',') + '\r\n';

  // Create CSV body rows
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in headers) {
      if (line !== '') line += ',';

      const header = headers[index];
      let value = array[i][header];

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      } else {
         // Convert to string to ensure replace works
         value = String(value);
      }

      // Handle strings containing commas, quotes, or newlines
      const result = value.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        value = `"${result}"`;
      }
      
      line += value;
    }
    str += line + '\r\n';
  }

  return str;
}

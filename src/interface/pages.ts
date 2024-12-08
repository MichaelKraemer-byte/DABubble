export interface Page {
    index: number | string;
    type: string;
    subPages?: Page[];
  }
export function extractFunctionIds(data: any[]): string[] {
  const result: string[] = [];

  data.forEach((category) => {
    category.functions?.forEach((func: any) => {
      result.push(func.id);

      // Nếu có functions lồng bên trong (tương lai mở rộng)
      if (Array.isArray(func.functions)) {
        func.functions.forEach((nestedFunc: any) => {
          result.push(nestedFunc.id);
        });
      }
    });
  });

  return result;
}

export function extractOpsIds(data: any[]): string[] {
  const result: string[] = [];

  data.forEach((category) => {
    category.functions?.forEach((func: any) => {
      func.ops?.forEach((op: any) => {
        result.push(op.id);
      });
    });
  });

  return result;
}

export function getOpsByFunctionId(data: any[], functionId: string): string[] {
  const result: string[] = [];

  data.forEach((category) => {
    category.functions?.forEach((func: any) => {
      if (func.id === functionId) {
        func.ops?.forEach((op: any) => {
          if (op.parentId === functionId) {
            result.push(op.id);
          }
        });
      }
      if (func?.functions?.length > 0) {
        func?.functions.forEach((funcChild: any) => {
          if (funcChild.id === functionId) {
            funcChild.ops?.forEach((opChild: any) => {
              if (opChild.parentId === functionId) {
                result.push(opChild.id);
              }
            });
          }
        });
      }
    });
  });

  return result;
}

export function getFunctionIdByOpsId(data: any[], opsId: string): string | null {
  for (const category of data) {
    for (const func of category.functions || []) {
      for (const op of func.ops || []) {
        if (op.id === opsId) {
          return op.parentId || null;
        }
      }
    }
  }
  return null;
}

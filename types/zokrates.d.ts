declare module "zokrates-js" {
  export interface Proof {
    proof: {
      a: string[];
      b: string[][];
      c: string[];
    };
    inputs: string[];
  }

  export interface ZoKratesProvider {
    compile: (source: string) => any;
    computeWitness: (
      artifacts: any,
      args: any[]
    ) => { witness: any; output: any };
    generateProof: (program: any, witness: any, provingKey: any) => Proof;
    initialize: () => Promise<ZoKratesProvider>;
  }

  export function initialize(): Promise<ZoKratesProvider>;
}

export type OperacionPago = {
  id: string;
  fecha: string;
  estado: string;

  publications: {
    titulo: string;
    precio_dia: number;
    owner_id: string;

    profiles: {
      nombre: string;
      email: string;
    };
  };
};
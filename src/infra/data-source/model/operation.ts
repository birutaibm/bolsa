import { Schema, Document, model, Types } from 'mongoose';

export type OperationDTO = {
  id?: any;
  date: Date;
  quantity: number;
  value: number;
};

type OperationModel = {
  id: Types.ObjectId;
  positionId: Types.ObjectId;
  date: number;
  quantity: number;
  value: number;
};

export type OperationDocument = Document & OperationModel;

const operationSchema = new Schema({
  positionId: {
    type: Schema.Types.ObjectId,
    ref: 'Position',
    require: true,
  },
  date: {
    type: Number,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  value: {
    type: Number,
    require: true,
  },
});

export default model<OperationDocument>('Operation', operationSchema);

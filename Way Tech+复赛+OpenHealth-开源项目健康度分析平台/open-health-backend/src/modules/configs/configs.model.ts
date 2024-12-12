import { modelOptions, prop, Severity } from '@typegoose/typegoose'

import { Schema } from 'mongoose'

@modelOptions({
  options: { allowMixed: Severity.ALLOW, customName: 'config' },
  schemaOptions: {
    timestamps: {
      createdAt: false,
      updatedAt: false,
    },
  },
})
export class ConfigModel {
  @prop({ unique: true, required: true })
  name: string

  @prop({ type: Schema.Types.Mixed })
  value: any
}

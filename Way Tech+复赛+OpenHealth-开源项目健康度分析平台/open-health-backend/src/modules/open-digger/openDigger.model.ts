import { modelOptions, prop, Severity } from '@typegoose/typegoose'
import { BaseModel } from '~/shared/model/base.model'

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    collection: 'open_digger_metrics',
    timestamps: true,
  },
})
export class OpenDiggerMetricsModel extends BaseModel {
  @prop({ required: true })
  platform: string

  @prop({ required: true })
  owner: string

  @prop({ required: true })
  repo: string

  @prop({ type: () => Object })
  activity?: Record<string, any>

  @prop({ type: () => Object })
  issues?: Record<string, any>

  @prop({ type: () => Object })
  pullRequests?: Record<string, any>

  @prop({ type: () => Object })
  codeChanges?: Record<string, any>

  @prop({ type: () => Object })
  contributors?: Record<string, any>

  @prop({ type: () => Object })
  openrank?: Record<string, any>

  @prop({ type: () => Object })
  attention?: Record<string, any>

  @prop({ default: Date.now })
  lastSyncTime: Date
}

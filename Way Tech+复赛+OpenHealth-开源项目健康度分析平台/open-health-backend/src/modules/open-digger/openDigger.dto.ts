import { IsNotEmpty, IsString } from 'class-validator'

export class OpenDiggerRepoDto {
  @IsString()
  @IsNotEmpty({ message: '平台名称不能为空' })
  readonly platform: string

  @IsString()
  @IsNotEmpty({ message: '仓库所有者不能为空' })
  readonly owner: string

  @IsString()
  @IsNotEmpty({ message: '仓库名称不能为空' })
  readonly repo: string
}

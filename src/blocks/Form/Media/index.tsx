import { Control, Controller, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Width } from '../Width'
import { Label } from '@/components/ui/label'
import { MediaUpload } from '@/payload-types'
import { Error } from '../Error'
import { FileUploader } from '@/components/FileUploader'

export const Media: React.FC<
  MediaUpload & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    control: Control
  }
> = ({ name, label, required, control, errors }) => {
  return (
    <Width width={100}>
      <Label htmlFor={label}>
        {label}
        {required && (
          <span className="required">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>
      <Controller
        control={control}
        name={name}
        rules={{ required: Boolean(required) }}
        render={({ field }) => {
          return (
            <FileUploader
              value={field.value}
              onValueChange={field.onChange}
              accept={{ 'image/*': [], 'application/pdf': [] }}
              maxFileCount={4}
              maxSize={4 * 1024 * 1024}
            />
          )
        }}
      />
      {errors[name] && <Error />}
    </Width>
  )
}

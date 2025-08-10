import { Button } from './ui/button'


export const ButtonAdd = ({ title, onClick }) => {
  return (
    <Button
      variant='add'
      onClick={onClick}
    >
      {title}
    </Button>
  )
}



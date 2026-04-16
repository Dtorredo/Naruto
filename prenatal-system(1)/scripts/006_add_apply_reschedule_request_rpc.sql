-- Transactional function to apply approved/proposed reschedule datetime to appointment
-- and mark request as approved in a single database transaction.
create or replace function public.apply_reschedule_request(
  p_request_id uuid,
  p_new_datetime timestamp with time zone,
  p_reviewer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment_id uuid;
begin
  select appointment_id
    into v_appointment_id
  from public.appointment_reschedule_requests
  where id = p_request_id
  for update;

  if v_appointment_id is null then
    raise exception 'Reschedule request not found';
  end if;

  update public.appointments
  set
    appointment_date = p_new_datetime, 
    status = 'confirmed',
    updated_at = timezone('utc'::text, now())
  where id = v_appointment_id;

  if not found then
    raise exception 'Appointment for reschedule request not found';
  end if;

  update public.appointment_reschedule_requests
  set
    status = 'approved',
    reviewed_by = p_reviewer_id,
    reviewed_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
  where id = p_request_id;

  if not found then
    raise exception 'Failed to update reschedule request';
  end if;
end;
$$;

grant execute on function public.apply_reschedule_request(uuid, timestamp with time zone, uuid) to authenticated, service_role;

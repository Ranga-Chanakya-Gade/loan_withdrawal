import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { DXC } from '../theme/dxcTheme';
import dxcLogo from '../../DXC-Full-Color.png';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setSubmitting(true);

    try {
      await login(username.trim(), password);
      const returnTo = searchParams.get('returnTo') ?? '/';
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      color: DXC.white,
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&.Mui-focused fieldset': { borderColor: DXC.trueBlue },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.4)',
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      '&.Mui-focused': { color: DXC.sky },
    },
    '& .MuiInputAdornment-root .MuiIconButton-root': {
      color: 'rgba(255,255,255,0.4)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: DXC.midnightBlue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background orbs */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '8%',
        width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${DXC.trueBlue}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '6%',
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${DXC.sky}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          p: { xs: 4, sm: 5 },
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src={dxcLogo}
          alt="DXC Technology"
          sx={{
            height: 34,
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />

        {/* Title */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{
            fontFamily: '"GT Standard Extended", "Arial Black", sans-serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: DXC.white,
            lineHeight: 1.2,
            mb: 0.75,
          }}>
            Loan & Withdrawal
          </Typography>
          <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
          }}>
            Insurance Smart App — DXC Technology
          </Typography>
        </Box>

        <Box sx={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

        {/* Fields */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ServiceNow Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            fullWidth
            disabled={submitting || isLoading}
            sx={fieldSx}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            disabled={submitting || isLoading}
            sx={fieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error */}
        {error && (
          <Box sx={{
            width: '100%',
            backgroundColor: 'rgba(209,70,0,0.12)',
            border: '1px solid rgba(209,70,0,0.3)',
            borderRadius: '10px',
            px: 2,
            py: 1.25,
          }}>
            <Typography sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.78rem',
              color: DXC.melon,
            }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={submitting || isLoading || !username.trim() || !password}
          startIcon={
            submitting
              ? <CircularProgress size={16} sx={{ color: 'inherit' }} />
              : <LockOutlinedIcon />
          }
          sx={{
            backgroundColor: DXC.trueBlue,
            borderRadius: '100px',
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700,
            fontSize: '0.88rem',
            textTransform: 'none',
            py: 1.25,
            '&:hover': { backgroundColor: DXC.royalBlue },
            '&.Mui-disabled': { backgroundColor: 'rgba(73,149,255,0.25)', color: 'rgba(255,255,255,0.3)' },
          }}
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockOutlinedIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} />
          <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.2)',
          }}>
            Authenticated via ServiceNow OAuth · Domain-separated
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

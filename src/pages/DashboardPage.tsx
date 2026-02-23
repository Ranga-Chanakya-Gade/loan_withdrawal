import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useCase } from '../context/CaseContext';
import { TouchLevelBadge } from '../components/shared/TouchLevelBadge';
import type { TouchLevel } from '../types/entities';
import { DXC } from '../theme/dxcTheme';

// ─── Mock dashboard data ───────────────────────────────────────────────────────
const DAILY_VOLUMES = [14, 22, 18, 31, 25, 19, 28];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PIPELINE = [
  { label: 'STP', count: 12, color: DXC.stp, bg: '#dcfce7' },
  { label: 'Low Touch', count: 8, color: DXC.trueBlue, bg: '#dbeafe' },
  { label: 'Moderate Touch', count: 19, color: '#b45309', bg: '#fef9c3' },
  { label: 'High Touch', count: 6, color: DXC.red, bg: '#fee2e2' },
  { label: 'NIGO', count: 4, color: DXC.melon, bg: '#fff3ec' },
];
const PIPELINE_TOTAL = PIPELINE.reduce((s, p) => s + p.count, 0);

const TXN_MIX = [
  { label: 'Policy Loan', count: 18, color: DXC.trueBlue },
  { label: 'Annuity Withdrawal', count: 12, color: DXC.sky },
  { label: 'Full Surrender', count: 7, color: DXC.gold },
  { label: 'Partial Surrender', count: 5, color: DXC.peach },
  { label: 'Annuity RMD', count: 5, color: DXC.melon },
];
const TXN_TOTAL = TXN_MIX.reduce((s, t) => s + t.count, 0);

type CaseStatus = 'APPROVED' | 'IN_REVIEW' | 'NIGO' | 'STP_AUTO';
const RECENT_CASES: {
  id: string; policy: string; owner: string; type: string;
  touchLevel: TouchLevel; status: CaseStatus; channel: string; minutesAgo: number;
}[] = [
  { id: 'CSE-2026-010891', policy: 'ANN-2024-034891', owner: 'Patricia M. Chen',    type: 'Annuity Withdrawal', touchLevel: 'LOW',      status: 'APPROVED',  channel: 'Portal',     minutesAgo: 12  },
  { id: 'CSE-2026-010847', policy: 'LF-2024-089423',  owner: 'James R. Whitfield',  type: 'Policy Loan',        touchLevel: 'MODERATE', status: 'IN_REVIEW', channel: 'Mail / Fax', minutesAgo: 38  },
  { id: 'CSE-2026-010829', policy: 'LF-2022-045219',  owner: 'Robert T. Martinez',  type: 'Policy Loan',        touchLevel: 'STP',      status: 'STP_AUTO',  channel: 'Portal',     minutesAgo: 54  },
  { id: 'CSE-2026-010811', policy: 'ANN-2023-087334', owner: 'Linda K. Johnson',    type: 'Full Surrender',     touchLevel: 'HIGH',     status: 'IN_REVIEW', channel: 'Mail / Fax', minutesAgo: 67  },
  { id: 'CSE-2026-010794', policy: 'LF-2019-033891',  owner: 'Michael D. Thompson', type: 'Partial Surrender',  touchLevel: 'MODERATE', status: 'NIGO',      channel: 'AWD',        minutesAgo: 94  },
  { id: 'CSE-2026-010782', policy: 'ANN-2021-056744', owner: 'Susan E. Patel',      type: 'Annuity RMD',        touchLevel: 'LOW',      status: 'APPROVED',  channel: 'Portal',     minutesAgo: 110 },
  { id: 'CSE-2026-010771', policy: 'LF-2020-078812',  owner: 'David L. Nguyen',     type: 'Policy Loan',        touchLevel: 'STP',      status: 'STP_AUTO',  channel: 'Portal',     minutesAgo: 128 },
];

const STATUS_CONFIG: Record<CaseStatus, { label: string; bg: string; color: string }> = {
  APPROVED:  { label: 'Approved',     bg: '#dcfce7', color: DXC.stp },
  IN_REVIEW: { label: 'In Review',    bg: '#dbeafe', color: DXC.trueBlue },
  NIGO:      { label: 'NIGO',         bg: '#fee2e2', color: DXC.red },
  STP_AUTO:  { label: 'STP Auto',     bg: '#dcfce7', color: DXC.stp },
};

function timeAgo(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 240;
  const H = 64;
  const pad = 6;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: pad + ((max - v) / range) * (H - pad * 2),
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pts[0].x},${H} ${polyline} ${pts[pts.length - 1].x},${H}`;
  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={color} />
    </svg>
  );
}

// ─── Hero KPI stat ─────────────────────────────────────────────────────────────
function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"GT Standard Extended", "Arial Black", sans-serif',
          fontWeight: 700,
          fontSize: '2rem',
          color: DXC.white,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', mt: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const { setScenario } = useCase();

  const startCase = (s: 'loan' | 'withdrawal') => {
    setScenario(s);
    navigate('/intake');
  };

  return (
    <Box>
      {/* ── Hero banner ── */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${DXC.midnightBlue} 0%, #0d2040 55%, #1a1438 100%)`,
          overflow: 'hidden',
          position: 'relative',
          border: 'none',
          boxShadow: '0 4px 32px rgba(14,16,32,0.25)',
        }}
      >
        {/* Decorative radial orbs */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${DXC.sky}18 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: 200, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${DXC.trueBlue}14 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '30%', right: '25%', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${DXC.gold}0e 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Chip
                  label="ServiceNow FSO"
                  size="small"
                  sx={{ backgroundColor: 'rgba(73,149,255,0.2)', color: DXC.sky, fontWeight: 700, fontSize: '0.65rem', border: '1px solid rgba(161,230,255,0.25)', height: 22 }}
                />
                <Chip
                  label="AI-Accelerated"
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,174,65,0.15)', color: DXC.gold, fontWeight: 700, fontSize: '0.65rem', border: '1px solid rgba(255,174,65,0.25)', height: 22 }}
                />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: '"GT Standard Extended", "Arial Black", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', md: '1.7rem' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: DXC.white,
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                Loan & Withdrawal
                <br />
                Smart App
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', maxWidth: 440 }}>
                Configurable financial transaction processing framework &mdash; Policy loans, surrenders, annuity withdrawals, and RMDs.
              </Typography>
            </Box>

            {/* Hero stats */}
            <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, flexWrap: 'wrap' }}>
              <HeroStat value="28" label="Cases today" />
              <HeroStat value="43%" label="STP rate" />
              <HeroStat value="91.2%" label="Avg IDP confidence" />
              <HeroStat value="2.4h" label="Avg processing time" />
            </Box>
          </Box>

          {/* Quick-start actions */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => startCase('loan')}
              sx={{ backgroundColor: DXC.trueBlue, '&:hover': { backgroundColor: DXC.royalBlue }, fontSize: '0.78rem' }}
            >
              New Policy Loan
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => startCase('withdrawal')}
              sx={{ backgroundColor: DXC.trueBlue, '&:hover': { backgroundColor: DXC.royalBlue }, fontSize: '0.78rem' }}
            >
              New Withdrawal
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountTreeIcon />}
              onClick={() => navigate('/triage')}
              sx={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)', '&:hover': { borderColor: DXC.sky, color: DXC.sky }, fontSize: '0.78rem' }}
            >
              Triage Engine
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── KPI cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total in Queue',    value: `${PIPELINE_TOTAL}`,   subtext: '28 received today',         accent: DXC.trueBlue,    icon: <AssignmentIcon /> },
          { label: 'STP Auto-Approved', value: '12',                   subtext: '43% of today\'s volume',    accent: DXC.stp,         icon: <CheckCircleIcon /> },
          { label: 'Low Touch',         value: '8',                    subtext: 'Pending approval',          accent: DXC.trueBlue,    icon: <SpeedIcon /> },
          { label: 'Moderate Touch',    value: '19',                   subtext: 'Awaiting review',           accent: DXC.gold,        icon: <SpeedIcon /> },
          { label: 'High Touch',        value: '6',                    subtext: 'Manual intervention',       accent: DXC.red,         icon: <ErrorOutlineIcon /> },
          { label: 'NIGO Returned',     value: '4',                    subtext: 'Customer action required',  accent: DXC.melon,       icon: <ErrorOutlineIcon /> },
        ].map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.label}>
            <Card sx={{ borderLeft: `4px solid ${kpi.accent}`, height: '100%', borderRadius: '16px' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="overline" sx={{ fontSize: '0.62rem', color: 'rgba(14,16,32,0.5)', lineHeight: 1.3, display: 'block', mb: 0.5 }}>
                    {kpi.label}
                  </Typography>
                  <Box sx={{ color: kpi.accent, opacity: 0.6 }}>
                    {kpi.icon}
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '1.8rem', color: '#0E1020', lineHeight: 1 }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(14,16,32,0.45)', mt: 0.5 }}>
                  {kpi.subtext}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts row ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>

        {/* Processing Pipeline */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 500, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 2 }}>
                Processing Pipeline
              </Typography>
              {PIPELINE.map((row) => {
                const pct = Math.round((row.count / PIPELINE_TOTAL) * 100);
                return (
                  <Box key={row.label} sx={{ mb: 1.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: row.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#0E1020' }}>{row.label}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: row.color }}>
                          {row.count}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(14,16,32,0.4)' }}>{pct}%</Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 7,
                        borderRadius: '100px',
                        backgroundColor: row.bg,
                        '& .MuiLinearProgress-bar': { backgroundColor: row.color, borderRadius: '100px' },
                      }}
                    />
                  </Box>
                );
              })}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(14,16,32,0.5)' }}>Total active cases</Typography>
                <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>{PIPELINE_TOTAL}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 7-Day Volume Trend */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 500, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  7-Day Volume
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: DXC.stp }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: DXC.stp }}>+47%</Typography>
                </Box>
              </Box>

              {/* Peak and avg stats */}
              <Box sx={{ display: 'flex', gap: 2.5, mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(14,16,32,0.4)' }}>Peak</Typography>
                  <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0E1020' }}>
                    {Math.max(...DAILY_VOLUMES)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(14,16,32,0.4)' }}>Avg / Day</Typography>
                  <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0E1020' }}>
                    {Math.round(DAILY_VOLUMES.reduce((a, b) => a + b) / DAILY_VOLUMES.length)}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(14,16,32,0.4)' }}>Today</Typography>
                  <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: DXC.trueBlue }}>
                    {DAILY_VOLUMES[DAILY_VOLUMES.length - 1]}
                  </Typography>
                </Box>
              </Box>

              {/* Sparkline */}
              <Box sx={{ mx: -0.5 }}>
                <Sparkline data={DAILY_VOLUMES} color={DXC.trueBlue} />
              </Box>

              {/* Day labels */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                {DAY_LABELS.map((d, i) => (
                  <Typography
                    key={d}
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: i === DAY_LABELS.length - 1 ? 700 : 400,
                      color: i === DAY_LABELS.length - 1 ? DXC.trueBlue : 'rgba(14,16,32,0.35)',
                    }}
                  >
                    {d}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Type Mix */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 500, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 2 }}>
                Transaction Mix
              </Typography>

              {/* Color bar */}
              <Box sx={{ display: 'flex', height: 10, borderRadius: '100px', overflow: 'hidden', mb: 2 }}>
                {TXN_MIX.map((t) => (
                  <Box
                    key={t.label}
                    sx={{
                      flex: t.count,
                      backgroundColor: t.color,
                      transition: 'flex 0.3s',
                    }}
                  />
                ))}
              </Box>

              {TXN_MIX.map((txn) => {
                const pct = Math.round((txn.count / TXN_TOTAL) * 100);
                return (
                  <Box key={txn.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: txn.color, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#0E1020' }}>{txn.label}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#0E1020', minWidth: 20, textAlign: 'right' }}>
                        {txn.count}
                      </Typography>
                      <Box sx={{ width: 36, textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(14,16,32,0.4)', fontWeight: 600 }}>{pct}%</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(14,16,32,0.5)' }}>Total this week</Typography>
                <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>{TXN_TOTAL}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Recent Cases table ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2 }}>
            <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent Cases
            </Typography>
            <Button
              size="small"
              endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ fontSize: '0.75rem', color: DXC.trueBlue }}
            >
              View All
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Case ID', 'Policy', 'Owner', 'Transaction Type', 'Touch Level', 'Status', 'Channel', 'Time'].map((h) => (
                    <TableCell key={h} sx={{ py: 1, fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: '#F6F3F0', color: 'rgba(14,16,32,0.55)', whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                  <TableCell sx={{ py: 1, backgroundColor: '#F6F3F0', width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {RECENT_CASES.map((c) => {
                  const statusCfg = STATUS_CONFIG[c.status];
                  return (
                    <TableRow
                      key={c.id}
                      sx={{ '&:hover': { backgroundColor: 'rgba(73,149,255,0.04)', cursor: 'pointer' } }}
                      onClick={() => navigate('/intake')}
                    >
                      <TableCell sx={{ py: 1.25, fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: DXC.trueBlue, whiteSpace: 'nowrap' }}>
                        {c.id}
                      </TableCell>
                      <TableCell sx={{ py: 1.25, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {c.policy}
                      </TableCell>
                      <TableCell sx={{ py: 1.25, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {c.owner}
                      </TableCell>
                      <TableCell sx={{ py: 1.25, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {c.type}
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <TouchLevelBadge level={c.touchLevel} />
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{ backgroundColor: statusCfg.bg, color: statusCfg.color, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.25, fontSize: '0.75rem', color: 'rgba(14,16,32,0.55)', whiteSpace: 'nowrap' }}>
                        {c.channel}
                      </TableCell>
                      <TableCell sx={{ py: 1.25, fontSize: '0.72rem', color: 'rgba(14,16,32,0.4)', whiteSpace: 'nowrap' }}>
                        {timeAgo(c.minutesAgo)}
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Tooltip title="Open case" arrow>
                          <IconButton size="small" sx={{ color: 'rgba(14,16,32,0.3)', '&:hover': { color: DXC.trueBlue } }}>
                            <OpenInNewIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── Quick action cards ── */}
      <Grid container spacing={2}>
        {[
          {
            icon: <AddCircleOutlineIcon sx={{ fontSize: 28 }} />,
            title: 'Start New Case',
            description: 'Submit a loan or withdrawal request — intake, IDP extraction, triage, and processing.',
            accent: DXC.trueBlue,
            action: () => navigate('/intake'),
            cta: 'Open Intake',
          },
          {
            icon: <AccountTreeIcon sx={{ fontSize: 28 }} />,
            title: 'Configure Triage',
            description: 'Build and test decision table rules. Add entity fields, set conditions, validate with live data.',
            accent: DXC.gold,
            action: () => navigate('/triage'),
            cta: 'Open Triage Builder',
          },
          {
            icon: <ErrorOutlineIcon sx={{ fontSize: 28 }} />,
            title: 'High Touch Queue',
            description: '6 cases awaiting full manual review. Financial calculator and entity comparison workspace.',
            accent: DXC.red,
            action: () => navigate('/processing/high'),
            cta: 'Open Queue',
          },
          {
            icon: <SpeedIcon sx={{ fontSize: 28 }} />,
            title: 'Moderate Touch Queue',
            description: '19 cases with flagged items awaiting secondary validation and good-order checklist sign-off.',
            accent: DXC.gold,
            action: () => navigate('/processing/moderate'),
            cta: 'Open Queue',
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                borderTop: `3px solid ${card.accent}`,
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: `0 8px 32px rgba(14,16,32,0.14)`, transform: 'translateY(-2px)' },
              }}
              onClick={card.action}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ color: card.accent, mb: 1.5 }}>{card.icon}</Box>
                <Typography sx={{ fontFamily: '"GT Standard Extended", "Arial Black", sans-serif', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.75 }}>
                  {card.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(14,16,32,0.6)', lineHeight: 1.5, flex: 1, mb: 2 }}>
                  {card.description}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ alignSelf: 'flex-start', fontSize: '0.72rem', borderColor: card.accent, color: card.accent, borderRadius: '8px', '&:hover': { backgroundColor: `${card.accent}0f` } }}
                >
                  {card.cta}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
